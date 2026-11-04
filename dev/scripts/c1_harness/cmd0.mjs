await A.waitForFunction(()=>document.getElementById('flPlay'),null,{timeout:400000});await A.waitForTimeout(8000);
await A.screenshot({path:'/tmp/c1/home.png'});
return await A.evaluate(()=>JSON.stringify({items:window.__mwMenu&&__mwMenu.items.map(i=>i.id),c1:!!window.__c1,card:!!document.getElementById('mwCard'),mwcss:[...document.querySelectorAll('style')].some(s=>s.textContent.includes('#mwCard')),ios:document.getElementById('menu').className,btns:[...document.querySelectorAll('#menu .dmBtn')].map(b=>b.id)}));
