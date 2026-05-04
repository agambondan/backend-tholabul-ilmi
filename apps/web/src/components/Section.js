const Section = ({ children }) => {
    return (
        <section className='bg-parchment-50 dark:bg-slate-900 pt-24 pb-8 flex-1'>
            {children}
        </section>
    );
};

export default Section;
