import {webkit} from '/workspace/milsim/node_modules/playwright/index.mjs';
const b=await webkit.launch();const p=await b.newPage();await p.setContent('<b>hi</b>');console.log(await p.innerText('b'));await b.close();
