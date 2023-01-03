import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import { withAuthUserTokenSSR } from 'next-firebase-auth'

import { Pagination } from 'flowbite-react'

import { MainLayout } from '@/components/Layout'

import { isMounted } from '@/hooks/isMounted'

import algoliasearch from 'algoliasearch/lite'

const SearchResults = ({ results: resultsFromSSR }) => {

  const router = useRouter()

  const { mounted } = isMounted()

  const { slug } = router.query

  const [ page, setPage ] = useState(1)
  const [ secondLoand, setSecondLoand ] = useState(false)

  const itemsPerPage = 5

  useEffect(() => {
    if(!mounted) return
    const func = async () => {
      setSecondLoand(true)
      if(!secondLoand) return
      return router.push("/search/"+slug+"?page="+page)
    }
    func()
  }, [mounted, page])

  return (
    <MainLayout title={"Amazon Clone - Search results for "+slug} description={"Amazon Clone - Search results for "+slug}>
      Search - Total Items: {resultsFromSSR?.nbHits || 0} Pages: {resultsFromSSR?.nbPages || 0} Page: {page}

      <div className="grid grid-cols-5 gap-4">
        {resultsFromSSR?.hits && resultsFromSSR?.hits?.map((item, index) => (
          <div key={index}>
            <div className="card w-96 bg-base-100 shadow-xl mb-2">
              <figure className="px-10 pt-10">
                <img src={item.thumbnail} alt={item.name} className="rounded-xl w-48 h-48" />
              </figure>
              <div className="card-body items-center text-center">
                <h2 className="card-title">{item.name}</h2>
                {/* <p>{item.description}</p> */}
                <div className="card-actions">
                  <button onClick={() => router.push("/"+item.path)} className="btn btn-primary">${item.price} - Go to product</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-row justify-center">
        Showing {(page-1)*itemsPerPage+1} to {Math.min(page * itemsPerPage, resultsFromSSR?.nbHits || 0)} of {resultsFromSSR?.nbHits || 0} results
      </div>

      {resultsFromSSR?.nbPages > 1 && <div className="flex flex-row justify-center">
        <Pagination
          currentPage={page}
          layout="pagination"
          onPageChange={(page) => setPage(page)}
          showIcons={true}
          totalPages={resultsFromSSR?.nbPages || 0}
          previousLabel="Previous"
          nextLabel="Next"
        />
      </div>}
    </MainLayout>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({})(async (q) => {

  const { query: { slug, page } } = q

  if(!slug || !page) return {
    props: {
      results: {nbPages: 0, page: 0, nbHits: 0, hits: []},
    },
    redirect: {
      destination: "/search/"+slug+"?page=1",
      permanent: false
    }
  }

  if(page < 1){
    return {
      redirect: {
        destination: "/search/"+slug+"?page=1",
        permanent: false
      }
    }
  }

  const searchClient = algoliasearch(process.env.ALGOLIA_APPID, process.env.ALLGOLIA_API_KEY)
  const index = searchClient.initIndex('name')

  const res = await index.search(slug, { page: page-1, hitsPerPage: 5 })

  return {
    props: {
      results: res
    }
  }
})

export default SearchResults

