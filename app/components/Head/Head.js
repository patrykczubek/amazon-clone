import Head from 'next/head'

export const PageHead = ({ title, description }) => {
  return (
    <Head>
      <title>{title ? title : "Amazon Clone"}</title>
      <meta name="description" content={description ? description : "Amazon Clone made by Patryk"} />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  )
}