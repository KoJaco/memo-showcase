type Props = {
    children: JSX.Element;
};

const Wrapper = ({ children }: Props) => {
    return (
        <div className="w-full min-h-[400px] bg-primary-foreground/10 rounded-lg items-center justify-center flex">
            {children}
        </div>
    );
};

export default Wrapper;
