// ===== wpn_data.js (#21, owner wpn): MW2(2009) arsenal as REAL-WORLD firearms. Original data/models only, no Activision assets.
// Stats: real cyclic rates/calibers/mags; damage/range are game-balanced in an MW2-like way. lvl = rank unlock (MW2-like progression).
const WPN=(()=>{
const W=[
// id,name,cls,rpm,dmg(max,min),range m,mag,reload s,lvl, model params
['m4a1','M4A1','ar',833,[30,20],60,30,2.2,4,{L:.84,bar:.37,stock:'coll',mag:'stanag',rail:1,hg:'quad'}],
['famas','FAMAS F1','ar',1100,[40,30],55,30,2.9,1,{L:.76,bar:.49,bull:1,mag:'stanag',handle:'famas'}],
['scarh','FN SCAR-H','ar',600,[40,30],70,20,2.4,8,{L:.97,bar:.40,stock:'scar',mag:'box20',rail:1,hg:'scar'}],
['tar21','IWI TAR-21','ar',900,[30,20],60,30,2.6,20,{L:.72,bar:.46,bull:1,mag:'stanag',rail:1,hg:'tavor'}],
['fal','FN FAL','ar',650,[55,40],80,20,2.7,28,{L:1.09,bar:.53,stock:'fixed',mag:'box20',hg:'wood',carry:1}],
['m16a4','M16A4','ar',900,[40,30],70,30,2.6,40,{L:1.0,bar:.51,stock:'fixed',mag:'stanag',rail:1,hg:'quad',burst:3}],
['acr','Remington ACR','ar',750,[30,20],65,30,2.3,48,{L:.90,bar:.37,stock:'scar',mag:'stanag',rail:1,hg:'acr'}],
['f2000','FN F2000','ar',850,[30,20],60,30,2.6,60,{L:.69,bar:.40,bull:1,mag:'stanag',hg:'f2000'}],
['ak47','AK-47','ar',600,[40,30],65,30,2.6,70,{L:.88,bar:.42,stock:'wood',mag:'ak',hg:'wood',gas:1}],
['mp5k','HK MP5K','smg',900,[30,20],25,30,2.2,4,{L:.33,bar:.12,stock:'none',mag:'mp5',fgrip:1,sc:.8}],
['ump45','HK UMP45','smg',600,[40,25],30,32,2.4,1,{L:.69,bar:.20,stock:'fold',mag:'box20',rail:1}],
['vector','KRISS Vector','smg',1200,[30,20],22,25,2.4,12,{L:.62,bar:.14,stock:'coll',mag:'glock',vector:1}],
['p90','FN P90','smg',900,[25,20],25,50,2.6,24,{L:.50,bar:.26,bull:1,mag:'top',p90:1}],
['uzi','Mini-Uzi','smg',1100,[30,20],20,32,2.3,44,{L:.60,bar:.20,stock:'fold',mag:'grip',sc:.85}],
['l86','L86 LSW','lmg',750,[40,30],80,100,6.5,1,{L:.90,bar:.65,bull:1,mag:'box100',bipod:1,hg:'sa80'}],
['rpd','RPD','lmg',750,[50,30],75,100,7.0,1,{L:1.04,bar:.52,stock:'wood',mag:'drum',bipod:1,hg:'wood'}],
['mg4','HK MG4','lmg',800,[40,30],75,100,6.0,16,{L:1.05,bar:.48,stock:'fold',mag:'box100',bipod:1,rail:1}],
['augh','Steyr AUG HBAR','lmg',700,[40,30],75,100,5.5,32,{L:.90,bar:.62,bull:1,mag:'box100',bipod:1,hg:'aug'}],
['m240','M240','lmg',650,[50,40],90,100,8.0,52,{L:1.25,bar:.63,stock:'fixed',mag:'box100',bipod:1,rail:1}],
['interv','CheyTac Intervention','sn',40,[98,98],600,5,3.6,4,{L:1.40,bar:.74,stock:'chey',mag:'box5',scope:1,bolt:1,bipod:1}],
['barrett','Barrett M82 .50cal','sn',150,[98,70],600,10,3.2,1,{L:1.45,bar:.74,stock:'m82',mag:'box5',scope:1,brake:1,bipod:1}],
['wa2000','Walther WA2000','sn',180,[70,50],500,6,3.0,1,{L:.90,bar:.65,bull:1,mag:'box5',scope:1,wa:1}],
['m21','M21 EBR','sn',300,[70,50],500,10,3.0,56,{L:1.12,bar:.56,stock:'ebr',mag:'box20',scope:1,rail:1}],
['pp2000','PP-2000','mp',900,[30,20],15,20,2.0,1,{L:.34,bar:.18,stock:'none',mag:'grip',sc:.8,pistol:1}],
['g18','Glock 18','mp',1100,[30,20],12,17,1.8,22,{L:.20,bar:.11,mag:'grip',pistol:1}],
['raffica','Beretta M93R','mp',1100,[40,30],15,20,1.9,38,{L:.24,bar:.16,mag:'grip',pistol:1,fgrip:1,burst:3}],
['tmp','Steyr TMP','mp',900,[30,20],15,15,1.9,58,{L:.28,bar:.13,mag:'grip',pistol:1,fgrip:1}],
['spas12','Franchi SPAS-12','sg',75,[40,10],10,8,4.0,1,{L:1.04,bar:.46,stock:'fold',mag:'tube',pump:1,pellets:8}],
['aa12','MPS AA-12','sg',300,[25,8],8,8,3.0,12,{L:.97,bar:.33,stock:'fixed',mag:'box20',pellets:8,sc:1}],
['striker','Armsel Striker','sg',300,[30,10],9,12,4.5,26,{L:.79,bar:.30,stock:'fold',mag:'drum',pellets:8}],
['ranger','Ranger double-barrel','sg',600,[50,12],8,2,2.4,42,{L:.75,bar:.40,stock:'wood',mag:'none',dbl:1,pellets:8,akimbo:1}],
['m1014','Benelli M1014','sg',240,[40,10],10,4,4.5,54,{L:1.01,bar:.47,stock:'coll',mag:'tube',pellets:8}],
['m1887','Winchester 1887','sg',70,[40,10],10,7,4.0,67,{L:1.0,bar:.51,stock:'wood',mag:'tube',lever:1,pellets:8}],
['usp','HK USP .45','hg',400,[40,30],20,12,1.7,1,{L:.20,bar:.11,mag:'grip',pistol:1}],
['mag44','.44 Magnum','hg',180,[50,40],25,6,2.9,26,{L:.30,bar:.16,mag:'none',pistol:1,rev:1}],
['m9','Beretta M9','hg',450,[40,20],18,15,1.7,46,{L:.22,bar:.13,mag:'grip',pistol:1}],
['deagle','Desert Eagle','hg',300,[50,35],25,7,2.0,62,{L:.27,bar:.15,mag:'grip',pistol:1}],
['at4','AT4-HS','ln',30,[150,150],400,1,4.5,1,{L:1.02,tube:.084,ln:'at4'}],
['thumper','M79 Thumper','ln',60,[150,150],300,1,2.5,1,{L:.73,tube:.04,ln:'m79',stock:'wood'}],
['stinger','FIM-92 Stinger','ln',30,[150,150],600,1,4.0,30,{L:1.52,tube:.07,ln:'stinger'}],
['javelin','FGM-148 Javelin','ln',20,[150,150],800,1,5.0,50,{L:1.2,tube:.14,ln:'jav'}],
['rpg7','RPG-7','ln',30,[150,150],300,1,4.0,65,{L:.95,tube:.04,ln:'rpg'}],
];
const EQUIP=[['frag','M67 frag','lethal',1],['semtex','Semtex','lethal',1],['knife','Throwing knife','lethal',7],['ti','Tactical insertion','lethal',11],['shield','Blast shield','lethal',19],['claymore','M18A1 Claymore','lethal',31],['c4','C4','lethal',43],
 ['flash','M84 flash','tactical',1],['stun','Stun grenade','tactical',1],['smoke','M18 smoke','tactical',1]];
const ATT={reddot:'Red dot',acog:'ACOG',holo:'Holographic',thermal:'Thermal',silencer:'Suppressor',grip:'Foregrip',fmj:'FMJ',xmags:'Extended mags',hb:'Heartbeat sensor',akimbo:'Akimbo',gl:'Grenade launcher',sgatt:'Shotgun attachment',rapid:'Rapid fire',tac:'Tactical knife',bipod:'Bipod',fdsc:'Shotgun attachment'};
const ATTBY={ar:['gl','reddot','silencer','acog','fmj','sgatt','holo','hb','thermal','xmags'],smg:['rapid','reddot','silencer','acog','fmj','akimbo','holo','thermal','xmags'],lmg:['grip','reddot','silencer','acog','fmj','holo','hb','thermal','xmags'],
 sn:['silencer','acog','fmj','hb','thermal','xmags'],mp:['reddot','silencer','fmj','akimbo','holo','xmags'],sg:['reddot','silencer','grip','fmj','akimbo','holo','xmags'],hg:['fmj','silencer','akimbo','tac','xmags'],ln:[]};
// Killstreaks (MW2 set) -> mapped onto existing DOMINION systems where available
const KS=[['uav','UAV',3],['cp','Care package',4],['cuav','Counter-UAV',4],['sentry','Sentry gun',5],['pred','Predator missile',5],['airstrike','Precision airstrike',6],['harrier','Harrier strike',7],['heli','Attack helicopter',7],
 ['emp_pk','Emergency airdrop',8],['pavelow','Pave Low',9],['stealth','Stealth bomber',9],['chopper','Chopper gunner',11],['ac130','AC-130',11],['emp','EMP',15],['nuke','Tactical nuke',25]];
const byId={};W.forEach(w=>byId[w[0]]={id:w[0],name:w[1],cls:w[2],rpm:w[3],dmg:w[4],range:w[5],mag:w[6],reload:w[7],lvl:w[8],m:w[9]});
const owner=()=>!!(window.__mp?__mp.ownerActive:(window.PRG&&PRG.d&&PRG.d.owner));
const unlocked=(cat,id,lvl)=>{if(owner())return true;if(window.PRG){if(PRG.isUnlocked(cat,id))return true;const d=PRG.d;return (d.p>0)||(d.lvl>=(lvl||1));}return true;};
return {W:byId,list:W.map(w=>byId[w[0]]),EQUIP,ATT,ATTBY,KS,owner,unlocked,count:()=>({weapons:W.length,equipment:EQUIP.length,attachments:Object.keys(ATT).length,killstreaks:KS.length})};})();
window.WPN=WPN;
