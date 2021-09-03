import Header from "../Header";

interface ContentWrapperProps {
  children: React.ReactNode;
}

export default function ContentWrapper({ children }: ContentWrapperProps) {
  return (
    <div className="scroll-pt-16 md:scroll-pt-0 relative flex flex-1 flex-col items-center focus:outline-none overflow-y-auto">
      <Header />
      <main className="p-4 w-full max-w-6xl sm:pb-6 sm:pt-0 sm:px-6 lg:pb-10 lg:px-10">
        <article className="m-auto mt-0 md:mt-4">{children}</article>
      </main>
    </div>
  );
}
