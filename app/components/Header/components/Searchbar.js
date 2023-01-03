import { useState, useMemo } from 'react'

import algoliasearch from 'algoliasearch/lite'
import { createLocalStorageRecentSearchesPlugin } from '@algolia/autocomplete-plugin-recent-searches'
import { createAutocomplete } from '@algolia/autocomplete-core'
import { getAlgoliaResults } from '@algolia/autocomplete-preset-algolia'
import { useRouter } from 'next/router'

const searchClient = algoliasearch('CQ2KQOZF5S', '05793ba0501fcd04a0b87f694a498c7f')
const recentSearchesPlugin = createLocalStorageRecentSearchesPlugin({
  key: 'RECENT_SEARCH',
  limit: 5,
})

const SearchBar = () => {
  const router = useRouter()

  const [ autocompleteState, setAutocompleteState ] = useState({})

  const autocomplete = useMemo(() =>
    createAutocomplete({
      onStateChange({ state }) {
        setAutocompleteState(state)
      },
      plugins: [recentSearchesPlugin],
      getSources() {
        return [{
          sourceId: 'products',
          getItemInputValue({ item }) {
            return item.query
          },
          getItems({ query }) {
            return getAlgoliaResults({
              searchClient,
              queries: [
                {
                  indexName: 'name_query_suggestions',
                  query,
                  params: {
                    hitsPerPage: 4,
                    highlightPreTag: '<mark>',
                    highlightPostTag: '</mark>'
                  }
                }
              ]
            })
          },
          getItemUrl({ item }) {
            return item.url
          },
          onSelect({ item }) {
            return router.push("/search/"+item.query+"?page=1")
          }
        }]
      }
    }), []
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    if(e.target[0].value.length >= 3) {
      return router.push("/search/"+e.target[0].value+"?page=1")
    }
  }

  return (
    <div className="hidden items-center h-10 rounded-md sm:flex flex-grow cursor-pointer" {...autocomplete.getRootProps({})}>
      <form className="flex flex-grow" onSubmit={handleSubmit}>
        <input className="rounded-lg p-2 h-full w-6 flex-grow rounded-l-md focus:outline-none px-4 text-black" type="submit" {...autocomplete.getInputProps({})}/>
      </form>
      <div {...autocomplete.getPanelProps({})}>
        {autocompleteState.isOpen && autocompleteState.collections.map((collection, index) => {
          const { source, items } = collection

          return (
            <div key={`source-${index}`} className="z-10 w-44 bg-white dark:bg-gray-700">
              {items.length > 0 && (
                <ul {...autocomplete.getListProps()}>
                  {items.map((item) => {
                    return (
                      <li key={item.objectID} {...autocomplete.getItemProps({item, source})}>
                        {item.query}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  // return ( // to fix -.-
  //   <div className="hidden items-center h-10 rounded-md sm:flex flex-grow cursor-pointer" {...autocomplete.getRootProps({})}>
  //     <input className="rounded-lg p-2 h-full w-6 flex-grow rounded-l-md focus:outline-none px-4 text-black" type="submit" {...autocomplete.getInputProps({})}/>
  //     <div className="aa-Panel" {...autocomplete.getPanelProps({})}>
  //       {autocompleteState.isOpen && autocompleteState.collections.map((collection, index) => {
  //         const { source, items } = collection

  //         return (
  //           <div key={`source-${index}`} className="aa-Source z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700">
  //             {items.length > 0 && (
  //               <ul className="aa-List" {...autocomplete.getListProps()}>
  //                 {items.map((item) => {
  //                   return (
  //                     <li key={item.objectID} className="aa-Item" {...autocomplete.getItemProps({item, source})}>
  //                       {item.query}
  //                     </li>
  //                   )
  //                 })}
  //               </ul>
  //             )}
  //           </div>
  //         )
  //       })}
  //     </div>
  //   </div>
  // )
}

export default SearchBar