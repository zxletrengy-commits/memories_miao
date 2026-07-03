/**
 * CharacterManager.js — Part 1 (loaded first)
 * Pixel art generation for lishen
 */
const CharacterPixel = {
  generate(charKey, state) {
    const W=14,H=20,S=4;
    const cvs=document.createElement('canvas');
    cvs.width=W*S; cvs.height=H*S;
    const ctx=cvs.getContext('2d');
    function px(x,y,c,w,h){ctx.fillStyle=c;ctx.fillRect(x*S,y*S,(w||1)*S,(h||1)*S);}

    if(charKey==='qiyu'){
      const sk='#f0d4b0',hr='#4a3a5a',eB='#4491DE',eP='#DE4387';
      const sh='#EB0876',pa='#3a3a4a',so='#1a1a1a',bl='#e8a0a0',mo='#c48060';
      px(5,9,sk,4);px(3,10,sh,8);px(2,11,sh,10);px(2,12,sh,10);px(3,13,sh,8);
      px(1,12,sk);px(12,12,sk);px(1,13,sk);px(12,13,sk);
      px(4,14,pa,6);px(3,15,pa,8);px(3,16,pa,2);px(9,16,pa,2);
      px(2,17,so,3);px(9,17,so,3);
      px(3,3,sk,8);px(2,4,sk,10);px(2,5,sk,10);px(2,6,sk,10);px(2,7,sk,10);px(3,8,sk,8);
      px(4,5,eB);px(4,6,eP);px(9,5,eB);px(9,6,eP);
      px(2,6,bl);px(11,6,bl);px(6,7,mo);
      px(2,0,hr,11);px(1,1,hr,12);px(1,2,hr,12);
      px(2,3,hr,3);px(9,3,hr,3);
      px(1,4,hr,2);px(11,4,hr,2);px(0,5,hr,2);px(12,5,hr,2);
      px(0,6,hr,3);px(11,6,hr,3);px(1,7,hr,2);px(11,7,hr,2);
      if(state==='sleep'){
        px(4,6,sk);px(9,6,sk);px(3,5,'#2a1a0a',2);px(9,5,'#2a1a0a',2);
        px(12,2,'#d4d4f0');px(11,1,'#d4d4f0');px(10,0,'#d4d4f0');
      }
    } else {
      const sk='#f0d8b8',hr='#0a0a0a';
      const eG='#D4883A',eY='#E8D060',eGr='#5ABF5A';
      const gl='#6a7a9a',sh='#f0f0f0',vs='#6a7a9a',vD='#4a5a7a';
      const pa='#3a3a4a',so='#1a1a1a';
      px(2,0,hr,3);px(6,0,hr,7);px(1,1,hr,4);px(6,1,hr,8);
      px(1,2,hr,3);px(8,2,hr,5);
      px(0,3,hr,2);px(2,3,sk,10);px(12,3,hr,2);
      px(0,4,hr,2);px(2,4,sk,10);px(12,4,hr,2);
      px(0,5,hr,2);px(2,5,sk,10);px(12,5,hr,2);
      px(0,6,hr,2);px(2,6,sk,10);px(12,6,hr,2);
      px(0,7,hr,2);px(2,7,sk,10);px(12,7,hr,2);
      px(0,8,hr,2);px(2,8,sk,10);px(12,8,hr,2);
      px(2,5,gl);px(3,5,gl,3,2);px(8,5,gl,3,2);
      px(11,5,gl);px(6,5,gl,2);px(6,6,gl,2);
      px(4,5,eG);px(5,5,eY);px(4,6,eGr,2);
      px(9,5,eG);px(10,5,eY);px(9,6,eGr,2);
      px(5,7,'#b8856a');px(6,7,'#c8957a',2);px(8,7,'#b8856a');
      px(5,8,'#e0c8a8',2);px(5,9,sk,4);
      px(4,10,sh,6);px(3,11,sh,8);px(3,12,sh,8);px(3,13,sh,8);
      px(2,10,vs,2);px(6,10,sk,2);px(10,10,vs,2);
      px(2,11,vs,2);px(5,11,sh,4);px(10,11,vs,2);
      px(2,12,vs,2);px(5,12,sh,4);px(10,12,vs,2);
      px(2,13,vs);px(4,13,vs,6);px(11,13,vs);
      px(6,11,vD);px(7,11,vD);px(6,12,vD);px(7,12,vD);
      px(1,12,sk);px(12,12,sk);px(1,13,sk);px(12,13,sk);
      px(4,14,pa,6);px(3,15,pa,8);px(3,16,pa,3);px(8,16,pa,3);
      px(2,17,so,4);px(8,17,so,4);
      if(state==='sleep'){
        px(4,6,sk,2);px(9,6,sk,2);
        px(3,5,'#2a2a2a',3);px(8,5,'#2a2a2a',3);
        px(12,3,'#d4d4f0');px(11,2,'#d4d4f0');px(10,1,'#d4d4f0');
      }
      if(state==='coffee'){
        px(12,10,'#8B4513',2,3);px(12,13,'#8B4513',2);
        px(14,11,'#6F3E0F');
      }
      if(state==='reading'){
        px(3,11,'#c8a878',4,4);px(2,11,'#8B6508');px(2,12,'#8B6508');
        px(2,13,'#8B6508');px(2,14,'#8B6508');
      }
    }
    return cvs;
  }
};
