import Head from 'next/head';
import {ReactElement} from 'react';
import Nav from '@/components/Nav';

interface Props extends Styleable {
  readonly children: ReactElement | ReactElement[];
}

const Layout = ({children}: Props) => {
  return (
    <>
      <Head>
        <title>내 블로그</title>
      </Head>
      <header>
        <Nav />
      </header>
      <main>{children}</main>
    </>
  );
};

export default Layout;
