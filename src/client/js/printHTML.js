// Print HTML Module
export function printHTML (id) {
    printJS({
        printable: id,
        type: 'html',
        targetStyles: ['*']
      });
}