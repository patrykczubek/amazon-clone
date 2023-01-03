import React, { useContext, useState, useMemo } from 'react'
import { useAuthUser } from 'next-firebase-auth'
import Image from 'next/image'
import Link from 'next/link'

import { useRouter } from 'next/router'
import { useTheme } from 'next-themes'
import ReactFlagsSelect from 'react-flags-select'


import { useLocationModal } from './components'
import { isMounted } from '@/hooks/isMounted'
import { CartContext } from '@/features/carts/context/CartContext'

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'

import Select from 'react-select'

// import i18n from 'i18n-next';
// import LanguageDetector from 'i18next-browser-languagedetector';
// https://blog.logrocket.com/react-localization-with-i18next/
// i18n
//   // load translation using http -> see /public/locales
//   // learn more: https://github.com/i18next/i18next-http-backend
//   .use(Backend)
//   // detect user language
//   // learn more: https://github.com/i18next/i18next-browser-languageDetector
//   .use(LanguageDetector)
//   // pass the i18n instance to react-i18next.
//   .use(initReactI18next)
//   // init i18next
//   // for all options read: https://www.i18next.com/overview/configuration-options
//   .init({
//     fallbackLng: 'en',
//     debug: true,

//     interpolation: {
//       escapeValue: false, // not needed for react as it escapes by default
//     },
//   });

import SearchBar from './components/Searchbar'

export const Header = () => {
  const user = useAuthUser()
  const router = useRouter()

  // console.log(router.locale, router.locales, router.defaultLocale)

  const { theme, setTheme } = useTheme()
  const { mounted } = isMounted()
  const { quantity } = useContext(CartContext)
  const { toggleLocationModal, LocationModal } = useLocationModal()

  //https://github.com/ekwonye-richard/react-flags-select/issues/141
  const [ selected, setSelected ] = useState("US");

  if (!mounted) {
    return null
  }

  return (
    <div className='flex bg-[#131921] items-center top-0 h-[60px]'>
      <div className="text-white mt-2 text-xs space-x-6 mx-6 py-1 px-1 whitespace-nowrap hover:outline-1 hover:outline hover:cursor-pointer w-[115px]">
        <Link href='/'>
          <a href="/">
            <Image src={'/assets/amazon.png'} alt="Picture" width={150} height={40} />
          </a>
        </Link>
      </div>

      <LocationModal/>

      <div className="text-white flex items-center text-xs space-x-6 mx-6 py-1 px-1 whitespace-nowrap hover:outline-1 hover:outline hover:cursor-pointer">
        <div onClick={toggleLocationModal}>
          <p>Delivery to Somewhere</p>
          <p className="font-extrabold">Michigan 48183</p>
        </div>
      </div>

      <SearchBar/>

      <div className="text-white flex items-center text-xs space-x-6 mx-6 whitespace-nowrap">
        <div className='hover:outline-1 hover:outline hover:cursor-pointer py-1 px-1'>
          <ReactFlagsSelect
            countries={["US", "PL", "GB", "FR", "DE", "IT"]}
            selectButtonClassName='outline-1 outline hover:cursor-pointer py-1 px-1 text-black'
            onSelect={(code) => setSelected(code)}
            selected={selected}
            className="text-gray-500"
            showSelectedLabel={false}
            showOptionLabel={false}
            optionsSize={16}
            fullWidth={false}
          />
        </div>

        <Link href='/dashboard/account'>
          <a className='hover:outline-1 hover:outline hover:cursor-pointer py-1 px-1'>
            <p>Hello, {user?.email ? (user?.displayName ? user.displayName : user.email) : "Sign in"}</p>
            <p className="font-extrabold">Account & Lists</p>
          </a>
        </Link>

        <Link href='/dashboard/orders'>
          <a className='hover:outline-1 hover:outline hover:cursor-pointer py-1 px-1'>
            <p>Returns</p>
            <p className="font-extrabold">& Orders</p>
          </a>
        </Link>

        <Link href='/cart'>
          <a className="relative flex items-center hover:outline-1 hover:outline hover:cursor-pointer px-2">
            <span className="absolute top-0 right-10 h-4 w-4 bg-yellow-400 text-center rounded-full text-black font-bold">{quantity}</span>
            <ShoppingCartIcon className="h-10"/>
            <p className="hidden md:inline font-extrabold md:text-sm mt-2">Cart</p>
          </a>
        </Link>

        <div className='hover:outline-1 hover:outline hover:cursor-pointer py-1 px-1'>
          {theme === 'dark' && <button onClick={() => setTheme('light')} type="button" aria-label="Color Mode" className="flex justify-center p-2 text-gray-500 transition duration-150 ease-in-out  border border-transparent rounded-md  lg:dark:bg-gray-900 dark:text-gray-200 dark:bg-gray-800  dark:hover:bg-gray-700 hover:text-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 "><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd"></path></svg></button>}
          {theme === 'light' && <button onClick={() => setTheme('dark')} type="button" aria-label="Color Mode" className="flex justify-center p-2 text-gray-500 transition duration-150 ease-in-out border border-transparent rounded-md lg:dark:bg-gray-900 dark:text-gray-200 dark:bg-gray-800  dark:hover:bg-gray-700 hover:text-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 "> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 transform -rotate-90"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg></button>}
        </div>
      </div>
    </div>
  )
}