import Link from 'next/link';

export type Props = {
  date: string;
  title: string;
  des: string;
  slug: string;
};

const BlogPost = ({date, title, des, slug}: Props) => {
  return (
    <Link href={`/blog/${slug}`} passHref className='w-full my-7 hover:-translate-x-1.5'>
      <div className='font-medium text-xs text-gray-400'>{date}</div>
      <div className={`font-extrabold text-2xl mt-2`}>{title}</div>
      <div className={`font-medium text-gray-600 text-xl mt-1`}>{des}</div>
    </Link>
  );
};

export default BlogPost;
