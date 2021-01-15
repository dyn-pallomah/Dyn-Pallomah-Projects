/*

JS 2D graphics library

Version: 5
Requirement: Engines it support at least HTML5, ES6

*/

/// #c

var c= {
	cvs: document.createElement('canvas'),
	w: 0,
	h: 0,
	offx: 0,
	offy: 0,
	scale: 1,
	backg: '',

	clock: ()=> 0,
	cps: 60,
	cpf: 5,
	cycle: 0,
	frame: 0,
	speed: 1,
	subcycle: 1,
	opc: 1,

	state: ' ',
	pending: '',
	stateFunc: {},
	normalState: [''],

	m: [],
	mcover: 0,
	mclick: 0,
	mox: 0,
	moy: 0,
	mx: 0,
	my: 0,
	k: [],
	oldk: [],
	firstk: [],

	font: {},
	intf: 'font',

	sound: {
		disabled: 1,
		ready: [],
		mute: 1,
		vol: 100,
	},

	event: [],
}
document.body.style.margin= '0';
document.body.append(c.cvs);
c.ctx= c.cvs.getContext('2d');

addEventListener('contextmenu', e=> e.preventDefault());
addEventListener('keydown', e=> {
	if(!/F\d/.test(e.key)) e.preventDefault();
	c.k[e.keyCode]= 1;
});
addEventListener('keyup', e=> c.k[e.keyCode]= 0);

c.cvs.addEventListener('mouseup', e=> {
	c.sound.disabled= 0;
	setInterval(()=> {
		while(c.sound.ready.length> 0) {
			var name= c.sound.ready[0];
			var sound= new Audio();
			sound.src= name;
			sound.volume= c.sound.vol/ 100* c.sound.mute;
			sound.play();
			c.sound.ready.splice(0, 1);

			for(var i= 0; i< c.sound.ready.length; i++)
				if(c.sound.ready[i]=== name) {
					c.sound.ready.splice(i, 1);
					i--;
				}
		}
	}, 10);
	c.state= c.pending;

	c.cvs.addEventListener('mousedown', e=> {
		c.m[e.button]= 1;
		[c.mox, c.moy]= [c.mx, c.my];
		c.mclick= 1;
	});
	addEventListener('mouseup', e=> {
		c.m[e.button]= 0;
		setTimeout(()=> c.mclick= 0);
	});
	addEventListener('mousemove', e=> [c.mx, c.my]= [(e.clientX- c.offx)/ c.scale- 8/ 3, (e.clientY- c.offy)/ c.scale- 8/ 3]);
	c.cvs.addEventListener('mouseover', e=> c.mcover= 1);
	c.cvs.addEventListener('mouseleave', e=> c.mcover= 0);

	set.state(' ', ()=> 0);
}, { once: true });

var align= ()=> {
	c.offx= (innerWidth- c.cvs.width)/ 2;
	c.offy= (innerHeight- c.cvs.height)/ 2;
	c.cvs.style.marginLeft= c.offx+ 'px';
	c.cvs.style.marginTop= c.offy+ 'px';
}
addEventListener('load', align);
addEventListener('resize', align);

/// #set

var set= {
	size: (w, h)=> [c.cvs.width, c.cvs.height, c.w, c.h]= [w, h, w/ 3, h/ 3],
	state: (state, func)=> c.stateFunc[state]= func,
	normalState: list=> c.normalState.push(...list),
	cursor: s=> c.cvs.style.cursor= s,

	scale: s=> [c.scale, c.w, c.h]= [s, c.cvs.width/ s, c.cvs.height/ s],
	backg: col=> c.backg= col,
	cps: cps=> c.cps= cps,
	cpf: cpf=> c.cpf= cpf,

	pref: pref=> c.pref= pref,
	clock: func=> c.clock= func,
	start: ()=> setInterval(()=> {
		if(c.subcycle>= c.speed) {
			c.ctx.imageSmoothingEnabled= false;
			if(c.sound.disabled) c.sound.ready= [];

			if(c.state in c.stateFunc) c.stateFunc[c.state]();
			else if(c.normalState.includes(c.state)) {
				clock.backg();
				clock.runAll();
				clock.rdrAll();
				c.clock();
				clock.cycle();
			}
			c.subcycle= 0;
		}
		c.subcycle++;

		for(var i= 0; i< c.k.length; i++) {
			if(c.k[i] && !c.oldk[i]) c.firstk[i]= 1;
			else if(c.k[i] && c.oldk[i]) c.firstk[i]= 0;
		}
		c.oldk= [...c.k];
	}, 1000/ c.cps),
	speed: s=> {
		c.subcycle= 0;
		c.speed= s;
	},

	intf: font=> c.intf= font,
	font: (name, w, h, sep)=> c.font[name]= {
		name: name,
		w: w,
		h: h,
		sep: sep,
	},

	sound: {
		mute: toggle=> c.sound.mute= toggle,
		vol: effect=> c.sound.vol+= effect,
	},
}

set.state(' ', ()=> {
	clock.backg('#d0d0d0');
	c.ctx.fillStyle= '#808080';
	c.ctx.font= 'bold 40px Consolas';
	var t= 'Tap to play',
			measure= c.ctx.measureText(t);
	c.ctx.fillText(t, (c.cvs.width- measure.width)/ 2,
								 c.cvs.height/ 2);    /// measure.actualBoundingBoxAscent- measure.actualBoundingBoxDescent
});

/// #clock func

var clock= {
	clr() {
		c.ctx.fillStyle= c.backg;
		c.ctx.fillRect(0, 0, c.cvs.width, c.cvs.height);
	},
	backg(col= c.backg) {
		c.ctx.fillStyle= col;
		c.ctx.fillRect(0, 0, c.cvs.width, c.cvs.height);
	},
	runAll() {
		spriteList.forEach(sprite=> window[sprite].run());
		c.m= [];
	},
	rdrAll: ()=> spriteList.forEach(sprite=> window[sprite].rdr()),
	cycle() {
		c.cycle++;
		c.frame= Math.floor(c.cycle/ c.cpf);
	},
}

/// #rdr func

var render= (name, cx, x, y, w, h, d= 0, fx= 1, fy= 1)=> {
	name= `${c.pref}.${name}.png`;
	var img= new Image();
	img.src= name;
	if(!w) w= img.width;	
	if(!h) h= img.height;

	if(x> -w && x< c.cvs.width/ c.scale && y> -h && y< c.cvs.height/ c.scale) {
		c.ctx.save();
		c.ctx.globalAlpha= c.opc< 0? 0: c.opc;
		c.ctx.scale(fx, fy);
		c.ctx.translate((Math.round(x)+ w/ 2)* c.scale* fx, (Math.round(y)+ h/ 2)* c.scale* fy);
		c.ctx.rotate(d* 90* Math.PI/ 180);

		c.ctx.drawImage(img, cx, 0, w, h, -w/ 2* c.scale, -h/ 2* c.scale, w* c.scale, h* c.scale);
		c.ctx.restore();
	}
}
var write= (t, x, y, s= 1, intf= c.intf)=> {
	intf= c.font[intf];
	var img= new Image();
	img.src= `${c.pref}.${intf.name}.png`;
	t= t.toString().toLowerCase();

	var w= 'abcdefghijklmnopqrstuvwxyz0123456789`~!##$%^&*()-_=+[{]}\\|;:\'",<.>/?';
	var index= 0;
	c.ctx.save();
	c.ctx.globalAlpha= c.opc< 0? 0: c.opc;
	for(var i= 0; i< t.length; i++) {
		if(t[i]=== '\n') {
			y+= intf.h;
			index= 0;
		}
		else {
			c.ctx.drawImage(img, w.indexOf(t[i])* intf.w, 0, intf.w, intf.h,
											(index* s* intf.sep+ x)* c.scale, y* s* c.scale, intf.w* s* c.scale, intf.h* s* c.scale);
			index++;
		}
	}
	c.ctx.restore();
}
var rect= (x, y, w, h, col, pixelPerfect= 0)=> {
	if(pixelPerfect) [x, y]= [Math.round(x), Math.round(y)];
	c.ctx.save();
	c.ctx.globalAlpha= c.opc< 0? 0: c.opc;
	c.ctx.fillStyle= col;
	c.ctx.fillRect(x* c.scale, y* c.scale, w* c.scale, h* c.scale);
	c.ctx.restore();
}
var play= path=> c.sound.ready.push(path+ '.wav');

/// #number

var rng= (r1, r2)=> ((r2=== undefined && ([r1, r2]= [0, r1])), Math.random()* (r2- r1)+ r1);

/// #sprite

var spriteList= [];
var sprite= (name, w, h, attr, local, rdr, run= ()=> 0)=> {
	spriteList.push(name);
	var it= window[name]= {
		$name: name,
		$attr: attr,
		w: w,
		h: h,
		package: {
			add: [],
			del: [],
			runBefore: [],
			runAfter: [],
		},

		run: ()=> {
			for(var i= 0; i< it.count; i++) if(!it.deleted[i]) {
				for(var n in it) window['$'+ n]= it.$attr.includes(n)? it[n][i]: it[n];
				window.id= i;
				it.package.runBefore.forEach(v=> v());
				run();
				it.package.runAfter.forEach(v=> v());
				for(var n in it) delete window['$'+ n];
				delete id;
			}
			for(var i= 0; i< it.count; i++) if(it.deleted[i]=== -1) {
				window.id= i;
				it.package.del.forEach(v=> v());
				it.$attr.forEach((v, x)=> it[v].splice(i, 1));
				it.deleted.splice(i, 1);
				i--;
				it.count--;
				delete id;
			}
		},
		add: (...attrs)=> {
			for(var n in attrs) window['$'+ it.$attr[n]]= attrs[n];
			it.attrs= attrs;
			it.package.add.forEach(v=> v());
			attr.forEach((v, x)=> it[v].push(it.attrs[x]));
			it.deleted.push(0);
			it.count++;
			for(var n in it) delete window['$'+ it.$attr[n]];
		},
		del: (permanent, i= id)=> it.deleted[i]= permanent? -1: 1,
		undel: (i= id)=> it.deleted[i]= 0,

		count: 0,
		deleted: [],
	}
	if(typeof rdr=== 'string') it.rdr= ()=> {
		var img= new Image();
		img.src= `${c.pref}.${rdr}.png`;
		for(var i= 0; i< it.count; i++) if(!it.deleted[i])
			render(rdr, 0, it.x[i], it.y[i], img.width, img.height, it.d && it.d[i] || 0);	/// it.d && it.d[i] === it.d?.[i]
	}
	else it.rdr= ()=> {
		for(var i= 0; i< it.count; i++) if(!it.deleted[i]) {
			for(var n in it) window['$'+ n]= it.$attr.includes(n)? it[n][i]: it[n];
			window.id= i;
			rdr();
			for(var n in it) delete window['$'+ n];
			delete id;
		}
	}
	attr.forEach(v=> it[v]= []);
	local.forEach(v=> it[v]= 0);
	delete it.attrs;
}

/// #package

var map= (associate= spriteList[spriteList.length- 1])=> {
	var it= window[associate];
	var get= attr=> it.attrs[it.$attr.indexOf(attr)];
	it.map= [];
	it.xx= [];
	it.yy= [];
	it.at= id=> it.map[it.yy[id]] && it.map[it.yy[id]][it.xx[id]];
	it.atPos= (x, y)=> it.map[y] && it.map[y][x];
	it.set= (id, v)=> {
		if(it.at(id)) it.map[it.yy[id]][it.xx[id]]= v;
	}
	it.setPos= (x, y, v)=> {
		if(it.at(x, y)) it[y][x]= v;
	}
	it.package.add.push(()=> {
		if(!it.map[$y]) it.map[$y]= [];
		it.map[$y][$x]= 1;
		it.xx.push($x);
		it.yy.push($y);
		it.attrs[it.$attr.indexOf('y')]*= it.h;
		it.attrs[it.$attr.indexOf('x')]*= it.w;
	});
}
var physics= (m, f, colList= [], associate= spriteList[spriteList.length- 1])=> {
	var it= window[associate];
	var get= attr=> it.attrs[it.$attr.indexOf(attr)];
	it.m= m;
	it.f= f;
	it.col= colList;
	it.colWith= sprite=> it.col= it.col.concat(sprite);
	it.collisionAccuracy= 1;
	if(!it.vx) it.vx= [];
	if(!it.vy) it.vy= [];
	it.land= [];

	it.package.runBefore.push(()=> {
		window.it= {};
		for(var v in it) it[v]= it[v];
		switch(it.collisionAccuracy) {
			case 0:
				it.x[id]+= it.vx[id];
				it.y[id]+= it.vy[id];
				break;
				/*case 1:
				var max= Math.max(it.x[id], it.y[id]),
						[lx, ly]= [it.vx[id], it.vy[id]],
						brk= 0;
				for(var i= 0; i< Math.floor(max); i++) {
					it.x[id]+= it.vx[id]/ max;
					lx-= it.vx[id]/ max;
					it.y[id]+= it.vy[id]/ max;
					ly-= it.vy[id]/ max;
				}
				it.x[id]+= lx;
				it.y[id]+= ly;
				break;*/
		}

		it.vx[id]*= it.land[id]? 1- it.f/ 100: 0.95;
		if(!it.land[id]) {
			if(it.vy[id]< it.m* 4) it.vy[id]+= it.m/ c.cps* 2;
			else it.vy[id]= it.m* 4;
		}
	});
	it.package.runAfter.push(()=> {
		for(var a= 0; a< it.col.length; a++) {
			var obj= window[it.col[a]];

			for(var i= 0; i< it.count; i++) {
				var land= 0;

				for(var j= 0; j< obj.count; j++)
					if(!obj.deleted[j] && col(it, i, obj, j) && !(obj.$name=== it.$name && i=== j)) {
						if(
							obj.x[j]- it.x[i]< it.w && it.x[i]- obj.x[j]< obj.w &&
							Math.abs(obj.x[j]- it.x[i])<= Math.abs(obj.y[j]- it.y[i])
						) {
							if(obj.y[j]- it.y[i]< it.h && obj.y[j]- it.y[i]> 0) {
								it.y[i]= obj.y[j]- it.h;

								var m= it.m/ (obj.m || 0)/ 2;
								if(m=== Infinity) m= 1;
								//if(it.land[i]) it.vy[i]= 0;
								if(obj.land && !obj.land[j]) it.vy[i]-= it.vy[i]* m;

								land= 1;

								//if(obj.vy) obj.vy[j]+= it.vy[i]* m;
								//it.vy[i]= 0;
							}
							if(it.y[i]- obj.y[j]< obj.h && it.y[i]- obj.y[j]> 0) {
								it.y[i]= obj.y[j]+ obj.h;

								var m= it.m/ (obj.m || 0)/ 2;
								if(m=== Infinity) m= 0;
								//if(obj.vy) obj.vy[j]-= it.vy[i]* m;
								if(!it.land[i]) it.vy[i]+= it.vy[i]* m;
								//it.vy[i]= 0;
							}
						}

						else if(
							obj.y[j]- it.y[i]< it.h && it.y[i]- obj.y[j]< obj.h &&
							Math.abs(obj.x[j]- it.x[i])> Math.abs(obj.y[j]- it.y[i])
						) {
							if(obj.x[j]- it.x[i]< it.w && obj.x[j]- it.x[i]> 0) {
								it.x[i]= obj.x[j]- it.w;

								var m= it.m/ (obj.m || 0)/ 2;
								if(m=== Infinity) m= 1;
								//if(obj.vx) obj.vx[j]+= it.vx[i]* m;
								it.vx[i]-= it.vx[i]* m;
								//it.vx[i]= 0;
							}
							if(it.x[i]- obj.x[j]< obj.w && it.x[i]- obj.x[j]> 0) {
								it.x[i]= obj.x[j]+ obj.w;

								var m= it.m/ (obj.m || 0)/ 2;
								if(m=== Infinity) m= 0;
								//if(obj.vx) obj.vx[j]-= it.vx[i]* m;
								it.vx[i]+= it.vx[i]* m;
								//it.vx[i]= 0;
							}
						}
					}
				it.land[i]= land;
			}
		}
	});
	it.package.add.push(()=> {
		if(!it.$attr.includes('vx')) it.vx.push(0);
		if(!it.$attr.includes('vy')) it.vy.push(0);
		it.land.push(0);
	});
	it.package.del.push(()=> {
		if(!it.$attr.includes('vx')) it.vx.splice(id, 1);
		if(!it.$attr.includes('vy')) it.vy.splice(id, 1);
		it.land.splice(id, 1);
	});
}

/// #event

var event= (name, scope= window, cond= ()=> 1)=> {
	window[name]= func=> {
		scope.addEventListener(name, e=> {
			if(c.state!== ' ' && cond()) {
				for(var v in e) window['$'+ v]= e[v];
				func();
				for(var v in e) delete window['$'+ v];
			}
		});
		var i= (c.event.indexOf(undefined)+ 1 || c.event.length+ 1)- 1;
		c.event[i]= func;
		return i; 
	}
}
event('keydown');
event('keyup');
event('mousedown', c.cvs);
event('mouseup', window, ()=> (c.mclick));
event('mousemove', c.cvs);
event('wheel', c.cvs);
event('contextmenu', c.cvs);

/// #data

var clk= (s, id, btn= 0)=> c.m[btn] && c.mox> s.x[id] && c.mox< s.x[id]+ s.w && c.moy> s.y[id] && c.moy< s.y[id]+ s.h;
var clkAt= (x, y, w, h, btn= 0)=> c.m[btn] && c.mox> x && c.mox< x+ w && c.moy> y && c.moy< y+ h;

var hov= (s, id)=> c.mx> s.x[id] && c.mx< s.x[id]+ s.w && c.my> s.y[id] && c.my< s.y[id]+ s.h;
var hovAt= (x, y, w, h)=> c.mx> x && c.mx< x+ w && c.my> y && c.my< y+ h;
var hovAny= s=> {
	for(var i= 0; i< s.count; i++)
		if(hov(s, i)) return 1;
	return 0;
}

var kd= (s, id, k, first= 0)=> (first? c.firstk[k]: c.k[k]) && c.mx> s.x[id] && c.mx< s.x[id]+ s.w && c.my> s.y[id] && c.my< s.y[id]+ s.h;
var kdAt= (x, y, w, h, k, first= 0)=> (first? c.firstk[k]: c.k[k]) && c.mx> x && c.mx< x+ w && c.my> y && c.my< y+ h;

var col= (s1, i1, s2, i2)=> (
	(s1.x[i1]< s2.x[i2]? s2.x[i2]- s1.x[i1]< s1.w: s1.x[i1]- s2.x[i2]< s2.w) &&
	(s1.y[i1]< s2.y[i2]? s2.y[i2]- s1.y[i1]< s1.h: s1.y[i1]- s2.y[i2]< s2.h)
);
var colAny= (s1, i1, s2)=> {
	for(var i2= 0; i2< s2.count; i2++)
		if(col(s1, i1, s2, i2) && !(s1.$name=== s2.$name && i1=== i2)) return 1;
	return 0;
}

var onScr= (s, id)=> s.x[id]> -s.w && s.x[id]< c.w && s.y[id]> -s.h && s.y[id]< c.h;
var near= (s1, i1, s2, i2, r)=> (
	(s1.x[i1]- r< s2.x[i2]? s2.x[i2]- s1.x[i1]+ r< s1.w+ r: s1.x[i1]- r- s2.x[i2]< s2.w+ r) &&
	(s1.y[i1]- r< s2.y[i2]? s2.y[i2]- s1.y[i1]+ r< s1.h+ r: s1.y[i1]- r- s2.y[i2]< s2.h+ r)
);
