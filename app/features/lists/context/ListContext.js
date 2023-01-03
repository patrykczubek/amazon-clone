import { createContext, useEffect, useState, useContext } from 'react'

import { useAuthUser } from 'next-firebase-auth'
import { useRouter } from 'next/router'

import { query, addDoc, collection, where, onSnapshot, arrayUnion, arrayRemove, doc, setDoc, Timestamp } from '@firebase/firestore'
import { db } from '@/utils/firebase'

import { isUserLoading } from '../../auth/hooks/isUserLoading'

import { CartContext } from '@/features/carts'

export const ListContext = createContext()
export const ListProvider = ({ children }) => {
  const router = useRouter()
  const AuthUser = useAuthUser()

  const { loading, hasUser } = isUserLoading(AuthUser)

  const { removeFromCart } = useContext(CartContext)

  const [ lists, setLists ] = useState([])

  const [ forLaterList, setForLaterList ] = useState()

  const [ dataLoading, setDataLoading ] = useState({ lists: true, listsWithAccess: true})

  const funcs = () => {
    const globalState = []

    const q = query(collection(db, "lists"), where("id", "==", AuthUser.id))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userLists = []

      querySnapshot.forEach((doc) => {
        if(doc.data()?.saveForLater){
          setForLaterList({docID: doc.id, ...doc.data()})
        }else{
          userLists.push({docID: doc.id, ...doc.data()})
          globalState.push({docID: doc.id, ...doc.data()})
        }
      })
      setLists(userLists)
      setDataLoading(prevState => ({...prevState, lists: false}))
    })

    const qq = query(collection(db, "lists"), where("accessEmails", "array-contains", AuthUser.email))
    const unsubscribe2 = onSnapshot(qq, (querySnapshott) => {
      const userAccessLists = []

      querySnapshott.forEach((docc) => {
        userAccessLists.push({docID: docc.id, ...docc.data()})
      })

      let combine = [...globalState, ...userAccessLists]
      setLists(combine)
      setDataLoading(prevState => ({...prevState, listsWithAccess: false}))
    })

    return () => {
      unsubscribe()
      unsubscribe2()
    }
  }

  useEffect(() => {
    const urlsToCheck = ['/dashboard/lists', '/cart', '/products/']

    const asPathMatches = urlsToCheck.some(pattern => {
      const regex = new RegExp(pattern)
      return regex.test(router.asPath)
    })

    if(!asPathMatches) return
    funcs()
  }, [router.asPath])

  const addToSaveForLater = async (itemID) => {
    if(!forLaterList){
      const list = await createSaveForLaterList(itemID)
      setForLaterList(list)
    }else{
      const docRef = doc(db, "lists", forLaterList.docID)
      setDoc(docRef, { items: arrayUnion(itemID) }, { merge: true })
    }
    removeFromCart(itemID)
  }

  const removeFromForLater = async (itemID) => {
    const docRef = doc(db, "lists", forLaterList.docID)
    setDoc(docRef, { items: arrayRemove(itemID) }, { merge: true })
  }

  const createSaveForLaterList = async(itemID) => {
    const docRef = await addDoc(collection(db, "lists"), {
      id: AuthUser.id,
      saveForLater: true,
      items: [itemID]
    })

    return docRef.id
  }

  const createList = async (listName, redirectSomewhere = true) => {
    const docRef = await addDoc(collection(db, "lists"), {
      listName: listName,
      id: AuthUser.id,
      private: true
    })

    if(redirectSomewhere){
      router.push(`/dashboard/lists/edit/${docRef.id}`)
    }
  }

  const toggleItemList = (listID, itemID) => {
    const foundList = lists.find(v => v.docID === listID)
    if(!foundList) return

    const findItem = foundList?.items?.find(item => item.itemID === itemID)

    const docRef = doc(db, "lists", listID)

    if(findItem){
      const items = [...foundList.items]
      const currentTodoIndex = foundList.items.findIndex((item) => item.itemID === itemID)

      items.splice(currentTodoIndex, 1)

      setDoc(docRef, { items: items }, { merge: true })
    }else{
      setDoc(docRef, { items: arrayUnion({addedBy: AuthUser.id, itemID: itemID, time: Timestamp.now(), bought: false, boughtBy: ""}) }, { merge: true })
    }
  }

  const switchToAnotherList = (currentListID, newListID, itemID) => {
    const findCurrentList = lists.find(v => v.docID === currentListID)
    if(!findCurrentList) return

    const findNewList = lists.find(v => v.docID === newListID)
    if(!findNewList) return

    const currentListItems = [...findCurrentList.items]
    const newListItems = findNewList?.items ? [...findNewList?.items] : []

    const findItem = findCurrentList?.items?.findIndex(item => item.itemID === itemID)
    currentListItems.splice(findItem, 1)

    const itemToSwitch = findCurrentList.items.find(item => item.itemID === itemID)

    newListItems.push(itemToSwitch)

    const currentListDocRef = doc(db, "lists", currentListID)
    const newListDocRef = doc(db, "lists", newListID)

    setDoc(currentListDocRef, { items: currentListItems }, { merge: true })
    setDoc(newListDocRef, { items: newListItems }, { merge: true })
  }

  const addItemExtras = (listID, itemID, extras) => {
    const { comment, priority, itemsNeeded, itemsHave } = extras

    const newItemsData = [ ...lists.find(v => v.docID === listID)?.items ]
    const foundItem = lists.find(v => v.docID === listID)?.items?.findIndex(item => item.itemID === itemID)

    Object.assign(newItemsData[foundItem], { extras: { comment, priority, itemsNeeded, itemsHave } })

    const docRef = doc(db, "lists", listID)

    setDoc(docRef, { items: newItemsData }, { merge: true })
  }

  const addUser = async (listID, email, permission) => {
    const docRef = doc(db, "lists", listID)

    setDoc(docRef, { accessEmails: arrayUnion(email), access: arrayUnion({email: email, permission: permission}) }, { merge: true });
  }

  const removeUser = async (listID, email) => {
    const docRef = doc(db, "lists", listID)

    const foundList = lists.find(v => v.docID === listID)
    const newUsers = foundList.access.filter(v => v.email !== email)

    setDoc(docRef, { accessEmails: arrayRemove(email), access: newUsers}, { merge: true })
  }

  const editUser = async (listID, email, permission) => {
    const docRef = doc(db, "lists", listID)

    const foundList = lists.find(v => v.docID === listID)
    const newUsers = foundList.access.map(v => {
      if(v.email === email){
        return {
          email: email,
          permission: permission
        }
      }else{
        return v
      }
    })

    setDoc(docRef, { access: newUsers }, { merge: true });
  }

  const changeListPrivacy = (listID, privacy) => {
    const docRef = doc(db, "lists", listID)
    setDoc(docRef, { private: privacy }, { merge: true })
  }

  const deleteList = (listID) => {
    const docRef = doc(db, "lists", listID)
    deleteDoc(docRef)
  }

  const addIdeaToList = (listID, { idea }) => {
    const docRef = doc(db, "lists", listID)
    setDoc(docRef, { items: arrayUnion({addedBy: AuthUser.id, itemID: null, name: idea, time: Timestamp.now(), bought: false, boughtBy: ""}) }, { merge: true })
  }

  return (
    <ListContext.Provider value={{
      lists,
      dataLoading,
      forLaterList,

      createList,
      toggleItemList,
      switchToAnotherList,
      addItemExtras,
      addUser,
      removeUser,
      editUser,
      changeListPrivacy,
      deleteList,
      addIdeaToList,

      addToSaveForLater,
      removeFromForLater
    }}>
      {children}
    </ListContext.Provider>
  )
}