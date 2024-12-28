import Header from "../Header";

interface ContentWrapperProps {
  children: React.ReactNode;
}

export default function ContentWrapper({ children }: ContentWrapperProps) {
  return (
    <div className="relative flex flex-1 scroll-pt-16 flex-col items-center overflow-y-auto focus:outline-none md:scroll-pt-0">
      <Header />
      <main className="w-full max-w-6xl p-4 sm:px-6 sm:pb-6 sm:pt-0 lg:px-10 lg:pb-10">
        <article className="m-auto mt-0 md:mt-4">{children}</article>
      </main>
    </div>
  );
}
