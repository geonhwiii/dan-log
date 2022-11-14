import {links} from '@/constants/links';
import Link from 'next/link';

const Nav = () => {
  return (
    <nav>
      {links.map((nav) => (
        <Link href={nav.link} key={nav.title}>
          <a className={`mr-5`}>{nav.title}</a>
        </Link>
      ))}
    </nav>
  );
};

export default Nav;
