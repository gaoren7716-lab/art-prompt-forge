/* ============================================================
 * operators-meta.js —— 算子的 preserve / change / forbid 三字段
 *
 * 本文件由 tools/gen_op_meta.js 自动生成，不要手工编辑。
 * 改了算子结构（inject / keep / only）就重跑生成器。
 *
 * 三字段的用途：
 *   preserve —— 变形时必须原样保留的面，是变形的底线
 *   change   —— 变形实际改动的面，其余来源在这些面上让位
 *   forbid   —— 绝对不能出现的特征，进负面词且不参与权重调节
 * ============================================================ */
if (typeof module !== "undefined" && module.exports) var _OMC = require("./data-core.js");

var OP_META = [
{ id:"OP-E-01", preserve:["brush","color","spirit","motif"], change:["medium","light","space"], forbid:["modern lighting","modern furniture","electric wires","plastic material","digital gloss","multiple light sources","oil impasto ridges"] },
{ id:"OP-E-02", preserve:["brush","color","spirit","motif"], change:["medium","light","space"], forbid:["modern lighting","modern furniture","electric wires","plastic material","digital gloss","flat even lighting","empty minimal composition"] },
{ id:"OP-E-03", preserve:["color","motif","spirit"], change:["medium","brush","light","space"], forbid:["modern lighting","modern furniture","electric wires","plastic material","digital gloss","cast shadow","atmospheric perspective","photoreal skin"] },
{ id:"OP-E-04", preserve:["brush","motif","spirit"], change:["medium","color","light","space"], forbid:["modern lighting","modern furniture","electric wires","plastic material","digital gloss","linear perspective","western horizon line","color saturation"] },
{ id:"OP-E-05", preserve:["brush","color","spirit","motif"], change:["medium","light","space"], forbid:["modern lighting","modern furniture","electric wires","plastic material","digital gloss","bright daylight","clean clinical surface"] },
{ id:"OP-E-06", preserve:["color","motif","spirit"], change:["medium","brush","light","space"], forbid:["modern lighting","modern furniture","electric wires","plastic material","digital gloss","heavy impasto","harsh contrast"] },
{ id:"OP-E-07", preserve:["brush","color","spirit","motif"], change:["medium","light","space"], forbid:["modern lighting","modern furniture","electric wires","plastic material","digital gloss","led panel","composite material","digital glow"] },
{ id:"OP-M-01", preserve:["color","space","motif","spirit"], change:["medium","brush","light"], forbid:["mixed incompatible physical media","physically impossible material layering","canvas weave","brush hair marks","gloss varnish"] },
{ id:"OP-M-02", preserve:["color","space","motif","spirit"], change:["medium","brush","light"], forbid:["mixed incompatible physical media","physically impossible material layering","impasto ridges","wet blending","deep shadow"] },
{ id:"OP-M-03", preserve:["space","motif","spirit"], change:["medium","brush","color","light"], forbid:["mixed incompatible physical media","physically impossible material layering","soft gradient","photographic texture","more than three spot colours"] },
{ id:"OP-M-04", preserve:["color","space","motif","spirit"], change:["medium","brush","light"], forbid:["mixed incompatible physical media","physically impossible material layering","airbrush smooth skin","rendered micro detail"] },
{ id:"OP-M-05", preserve:["light","space","motif","spirit"], change:["medium","color","brush"], forbid:["mixed incompatible physical media","physically impossible material layering","soft optical blending","continuous tone gradient"] },
{ id:"OP-M-06", preserve:["color","space","motif","spirit"], change:["medium","brush","light"], forbid:["mixed incompatible physical media","physically impossible material layering","colour","smooth gradient","photographic depth of field"] },
{ id:"OP-M-07", preserve:["color","space","motif","spirit"], change:["medium","brush","light"], forbid:["mixed incompatible physical media","physically impossible material layering","visible brushstroke","painted texture","canvas weave"] },
{ id:"OP-M-08", preserve:["space","motif","spirit"], change:["medium","brush","color","light"], forbid:["mixed incompatible physical media","physically impossible material layering","synthetic fluorescent hue","smooth digital surface"] },
{ id:"OP-M-09", preserve:["color","space","motif","spirit"], change:["medium","brush","light"], forbid:["mixed incompatible physical media","physically impossible material layering","canvas texture","handmade irregularity","impasto"] },
{ id:"OP-M-10", preserve:["color","light","motif","spirit"], change:["medium","brush","space"], forbid:["mixed incompatible physical media","physically impossible material layering","paper fibre","hand drawn outline","physical print artefact"] },
{ id:"OP-S-01", preserve:["medium","brush","color","spirit"], change:["motif","light","space"], forbid:["wrong era props","anachronistic objects","empty narrative scene","empty landscape without subject","modern urban elements"] },
{ id:"OP-S-02", preserve:["medium","brush","color","spirit"], change:["motif","light","space"], forbid:["wrong era props","anachronistic objects","empty narrative scene","carnival crowds","flat graphic signage"] },
{ id:"OP-S-03", preserve:["medium","brush","color","spirit"], change:["motif","light","space"], forbid:["wrong era props","anachronistic objects","empty narrative scene","clinical emptiness","modern furniture"] },
{ id:"OP-S-04", preserve:["medium","brush","color","spirit"], change:["motif","light","space"], forbid:["wrong era props","anachronistic objects","empty narrative scene","purely abstract field","no human presence"] },
{ id:"OP-S-05", preserve:["medium","brush","color","spirit"], change:["motif","light","space"], forbid:["wrong era props","anachronistic objects","empty narrative scene","wide establishing shot","tiny distant subject"] },
{ id:"OP-S-06", preserve:["medium","brush","color","motif","spirit"], change:["space","light"], forbid:["wrong era props","anachronistic objects","empty narrative scene","human figure","figurative narrative"] },
{ id:"OP-S-07", preserve:["medium","brush","color","spirit"], change:["motif","space","light"], forbid:["wrong era props","anachronistic objects","empty narrative scene","empty architectural shell","absence of atmosphere"] },
{ id:"OP-S-08", preserve:["medium","brush","color","spirit"], change:["motif","light","space"], forbid:["wrong era props","anachronistic objects","empty narrative scene","scattered clutter","hard edge geometric order"] },
{ id:"OP-D-01", preserve:["color"], change:["medium","brush","light","space","motif","spirit"], forbid:["uncontrolled style bleed from muted facets","impasto texture","structural line emphasis"] },
{ id:"OP-D-02", preserve:["brush"], change:["medium","color","light","space","motif","spirit"], forbid:["uncontrolled style bleed from muted facets","flat decorative colour","linear perspective stress"] },
{ id:"OP-D-03", preserve:["space"], change:["medium","brush","color","light","motif","spirit"], forbid:["uncontrolled style bleed from muted facets","volumetric light modelling","surface texture emphasis"] },
{ id:"OP-D-04", preserve:["light"], change:["medium","brush","color","space","motif","spirit"], forbid:["uncontrolled style bleed from muted facets","hard edge graphic division","flat colour blocking"] },
{ id:"OP-D-05", preserve:["spirit","motif"], change:["medium","brush","color","light","space"], forbid:["uncontrolled style bleed from muted facets","surface texture emphasis","perspective construction"] },
{ id:"OP-F-01", preserve:["medium","brush","color","light","space","motif","spirit"], change:[], forbid:["featureless generic output","identity dilution between sources","identity dilution","uniformly averaged output"] },
{ id:"OP-F-02", preserve:["medium","brush","color","light","space","motif","spirit"], change:[], forbid:["featureless generic output","identity dilution between sources","identity dilution","mutually cancelling directives"] },
{ id:"OP-F-03", preserve:["medium","brush","color","light","space","motif","spirit"], change:[], forbid:["featureless generic output","identity dilution between sources"] },
{ id:"OP-P-01", preserve:["medium","brush","color","light","space","motif","spirit"], change:[], forbid:["text artifacts","watermark","signature","flat even lighting","blown highlight"] },
{ id:"OP-P-02", preserve:["medium","brush","color","light","space","motif","spirit"], change:[], forbid:["text artifacts","watermark","signature","pristine digital surface","hdr bloom","oversaturated neon"] },
{ id:"OP-P-03", preserve:["medium","brush","color","light","space","motif","spirit"], change:[], forbid:["text artifacts","watermark","signature","plastic texture","vector flatness"] },
{ id:"OP-P-04", preserve:["medium","brush","color","light","space","motif","spirit"], change:[], forbid:["text artifacts","watermark","signature","shallow depth of field","blurred fine detail"] },
{ id:"OP-P-05", preserve:["medium","brush","color","light","space","motif","spirit"], change:[], forbid:["text artifacts","watermark","signature","flat even lighting","no light hierarchy"] }
];

/* 把三字段挂回算子本体，引擎与界面读同一个对象，避免两份数据不一致。
   注意：浏览器里顶层 var 会挂到 window 上，所以要同时兼容 window.OPERATORS */
var _OMC = (typeof module !== "undefined" && module.exports)
  ? require("./data-core.js")
  : (typeof window !== "undefined" ? window : this);
OP_META.forEach(function (m) {
  var list = _OMC.OPERATORS || (typeof OPERATORS !== "undefined" ? OPERATORS : []);
  var o = list.filter(function (x) { return x.id === m.id; })[0];
  if (!o) return;
  o.preserve = m.preserve; o.change = m.change; o.forbid = m.forbid;
});

if (typeof module !== "undefined" && module.exports) module.exports = { OP_META };
