import { Fader } from "~/components//fader";
import { ContactForm } from "~/components/forms/contact-form";
import { PageIntro } from "~/components/sections/page-intro";
import { Container } from "~/components/ui/container";

const ContactPage = () => {
    return (
        <div className="min-h-screen lg:-mt-40 lg:pt-40">
            <div className="max-w-xl mx-auto h-full">
                <PageIntro
                    eyebrow={"Get in touch"}
                    title={"Can't wait to hear from you!"}
                >
                    <p></p>
                </PageIntro>
                <Container className="my-10 text-left max-w-xl mx-auto">
                    <Fader className="flex flex-col gap-8">
                        <ContactForm />
                    </Fader>
                </Container>
            </div>
        </div>
    );
};

export default ContactPage;
