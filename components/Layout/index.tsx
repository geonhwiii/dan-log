import Head from 'next/head';
import {ReactElement} from 'react';
import Nav from '@/components/Nav';
import Image from 'next/image';
import Avatar from '@/assets/avatar.png';

interface Props extends Styleable {
  readonly children: ReactElement | ReactElement[];
}

const Layout = ({children}: Props) => {
  return (
    <>
      <Head>
        <title>내 블로그</title>
      </Head>
      <header className={`w-full max-w-3xl flex flex-row justify-between items-center my-1`}>
        <div className={`flex flex-row items-center`}>
          <Image src={Avatar} alt='avatar' width={40} height={40} className={`rounded-full`} />
          <span className={`mx-2 font-extralight text-lg`}>{'Dan Log'}</span>
        </div>
        <Nav />
      </header>
      <main>{children}</main>
    </>
  );
};

export default Layout;
