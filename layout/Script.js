export default function Script({ children }) {
    return (<script dangerouslySetInnerHTML={{ __html: `(${children.toString()})();` }}></script>)
}