import { Link, Outlet } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";
import BackgroundStatic from "~/components/background-static";
import { Fader } from "~/components//fader";

const PoliciesLayout = () => {
    return (
        <div className="relative h-full w-full">
            <BackgroundStatic />
            <div className="max-w-[160px] text-sm gap-y-2 flex-col text-foreground/50 lg:flex hidden transition-opacity duration-300 fixed left-10 top-40 group/nav">
                <Fader>
                    <h1 className="text-xl text-foreground mb-2">Memo</h1>
                    <p className="text-md mb-4">
                        Structured output, <br />
                        powerful natural language
                    </p>

                    <Link
                        to="/"
                        className="flex gap-x-1 items-center text-foreground/50 hover:text-foreground transition-colors duration-300"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Home
                    </Link>
                </Fader>
            </div>

            <Outlet />
        </div>
    );
};

export default PoliciesLayout;
