import Navbar from './navbar';

type Props = {
  children: JSX.Element;
};

export default function Layout({ children }: Props) {
  return (
    <div className="sm:w-9/12 max-w-screen-xl m-auto pt-6 px-2">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
