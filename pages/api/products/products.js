import { getFirestore } from 'firebase-admin/firestore'

import { registerService } from '@/utils/registerService'

import { getRedisClient } from '@/utils/redis'

let redisInstance

const tryConnection = () => {
  redisInstance = registerService('db', () => getRedisClient())
}

tryConnection()

redisInstance.on("connect", () => {
  console.log("connected")
})

const db = getFirestore()

const getProductsFromRedis = async (ids) => {
  const data = []

  for(let i = 0; i < ids.length; i++){
    const item = await redisInstance.get(ids[i])
    data.push(JSON.parse(item))
  }

  return data
}

const getProductsFromFirebase = async (ids, path) => {
  if (!ids || !ids.length || !path) return []

  const batches = []

  while (ids.length) {
    const batch = ids.splice(0, 10)

    batches.push(db.collection(path).where('__name__', 'in', [...batch]).get().then((results) => {
      results.forEach(doc => {
        redisInstance.set(doc.id, JSON.stringify({id: doc.id, ...doc.data()}), `PX`, 60_000 * 60)
      })
      return results.docs.map(result => ({  id: result.id,  ...result.data() }))
    }))
  }

  return Promise.all(batches).then(content => content.flat())
}

const handler = async (req, res) => {
  if(!req.body) return res.status(400).json({message: 'No body'})

  const items = JSON.parse(req.body)

  const allProducts = await redisInstance.get('allProducts')

  if(allProducts) {
    let parsed = JSON.parse(allProducts)

    const oneHourAgo = Date.now() - 60_000 * 60;

    let notInRedisOrExpired = items.filter(item => {
      let value = parsed.find(object => item === object.id && object.lastTime > oneHourAgo)
      if(!value) return item
    })

    let foundInRedis = items.filter(item => {
      let value = parsed.find(object => item === object.id && object.lastTime < oneHourAgo)
      if(!value) return item
    })

    let notInRedisData = []
    if(notInRedisOrExpired.length > 0){
      notInRedisData = await getProductsFromFirebase(notInRedisOrExpired, 'products')
    }

    let inRedisData = []
    if(foundInRedis.length > 0){
      inRedisData = await getProductsFromRedis(foundInRedis)
    }

    let newData = notInRedisData.map(({id}) => ({id, lastTime: Date.now()}))

    let merged = parsed.concat(newData)
    merged = merged.filter((item, index, self) => {
      return item.lastTime > oneHourAgo && self.findIndex(i => i.id === item.id) === index
    })

    redisInstance.set('allProducts', JSON.stringify(merged))

    const dataCombined = [...inRedisData, ...notInRedisData]

    return res.status(200).json({ data: dataCombined })
  }else{
    const firebaseData = await getProductsFromFirebase(items, 'products')

    const newArray = items.map((item) => {
      return {
        id: item,
        lastTime: Date.now()
      }
    })

    redisInstance.set('allProducts', JSON.stringify(newArray))

    return res.status(200).json({ data: firebaseData })
  }
}

export default handler
