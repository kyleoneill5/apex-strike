//GDECLUTTER-BEGIN  HUD declutter (Kyle): help/hint popups hidden by default, redundant labels removed, centre message kept clear of HUD cards. CSS-only + tutorial auto-dismiss.
{const st=document.createElement('style');st.textContent=`
#tut{display:none!important}
#gsToast{display:none!important}
#thrl{display:none!important}
#msg{top:calc(var(--sat,0px) + 46%)!important;max-width:70vw;font-size:13px!important;line-height:1.3!important;white-space:normal;text-align:center;left:50%!important;transform:translateX(-50%)!important}
@media (orientation:portrait){#msg{top:calc(var(--sat,0px) + 52%)!important;max-width:86vw}}`;document.head.appendChild(st);
 try{localStorage.setItem('tutSeen','1');}catch(e){}
 const ok=document.getElementById('tutOk');if(ok)setTimeout(()=>{try{ok.click();}catch(e){}},0);}
//GDECLUTTER-END
