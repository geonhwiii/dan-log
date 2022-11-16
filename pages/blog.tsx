import BlogPost from '@/components/BlogPost';
import Layout from '@/components/Layout';
import {allPosts} from '@/contentlayer/generated';
import {InferGetStaticPropsType} from 'next';

const Blog = ({posts}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <Layout>
      <div className={`mt-10 flex flex-col`}>
        {posts.map((post) => (
          <BlogPost date={post.date} title={post.title} des={post.description} slug={post._raw.flattenedPath} key={post._id} />
        ))}
      </div>
    </Layout>
  );
};

export const getStaticProps = async () => {
  const posts = allPosts.sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)));

  return {
    props: {
      posts,
    },
  };
};
export default Blog;
