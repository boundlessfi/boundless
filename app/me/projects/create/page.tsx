import { redirect } from 'next/navigation';

const page = () => {
  redirect('/projects/create');
};

export default page;
