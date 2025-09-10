export default function Contact() {
    return (
        <section className="py-16">
            <h2 className="text-3xl font-semibold mb-6">Contact</h2>
            <form name="contact" method="POST" data-netlify="true" className="max-w-lg space-y-4">
                <input type="hidden" name="form-name" value="contact" />
                <input className="w-full rounded-xl bg-white/5 border border-white/10 p-3" name="name" placeholder="Your name" required />
                <input className="w-full rounded-xl bg-white/5 border border-white/10 p-3" name="email" type="email" placeholder="Email" required />
                <textarea className="w-full rounded-xl bg-white/5 border border-white/10 p-3" name="message" rows={5} placeholder="Message" required />
                <button className="rounded-2xl px-5 py-3 bg-white text-black hover:opacity-90">Send</button>
            </form>
            <p className="mt-6 opacity-70 text-sm">
                Or email <a className="underline" href="mailto:hi@filipondrej.com">hi@filipondrej.com</a>
            </p>
        </section>
    );
}
