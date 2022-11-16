import Layout from '@/components/Layout';
import {allPosts} from '@/contentlayer/generated';
import {InferGetStaticPropsType} from 'next';
import {useMDXComponent} from 'next-contentlayer/hooks';

const Post = ({post}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const MDXComponent = useMDXComponent(post.body.code);
  return (
    <Layout>
      <div className='mt-10 prose'>
        <h1 className='text-sky-700'>{post.title}</h1>
        <MDXComponent />
      </div>
    </Layout>
  );
};

export const getStaticPaths = async () => {
  return {
    paths: allPosts.map((p) => ({params: {slug: p._raw.flattenedPath}})),
    fallback: false,
  };
};

export const getStaticProps = async ({params}: any) => {
  const post = allPosts.find((p) => p._raw.flattenedPath === params.slug)!;
  return {
    props: {
      post,
    },
  };
};

export default Post;
