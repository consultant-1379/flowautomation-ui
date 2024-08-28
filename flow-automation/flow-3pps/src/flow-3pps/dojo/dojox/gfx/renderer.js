define(["./_base", "flow-3pps/dojo/dojox/gfx/svg"],
  function(g, svgRenderer){
  //>> noBuildResolver
	g.renderer = 'svg';
	return svgRenderer;
});
