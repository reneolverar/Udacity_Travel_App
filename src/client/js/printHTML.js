// Print HTML Module
export function printHTML (id) {
    printJS({
        printable: id,
        type: 'html',
        targetStyles: ['*'],
        // css: 'http://localhost:8081/dist/main.css'
      });
}