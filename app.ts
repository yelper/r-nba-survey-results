/// <reference path="d3.d.ts" />

var colorbrewer: any;

interface scaleItem {
    key: string | number;
    name: string;
    value: number;
}

interface questionData {
    key: string;
    desc?: string;
    title: string;
    data: scaleItem[];
}

interface anovaGroup {
    key: string;
    name: string;
    bball_rl: number;
    online_social: number;
    mean: number;
    stderr: number;
}

interface sigGroup {
    between: [string, string];
    p_value: number;
}

interface teamGroup {
    team: string;
    key: string;
    favorite: number;
    rooting: number;
}

interface anovaData {
    key: string;
    desc?: string;
    title: string;
    data: anovaGroup[];
    significance: sigGroup[];
}

interface allData {
    questions: questionData[];
    ANOVA: anovaData[];
    teams: teamGroup[];
}

// with thanks to <http://bl.ocks.org/mbostock/7555321>
// and <http://stackoverflow.com/questions/32804813/converting-javascript-function-to-typescript-including-getcomputedtextlength>
function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      var node: SVGTSpanElement = <SVGTSpanElement>tspan.node();
      var hasGreaterWidth = node.getComputedTextLength() > width;
      if (hasGreaterWidth) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}

// with thanks to <http://bl.ocks.org/mbostock/4b66c0d9be9a0d56484e>
function addBackingRect(toSelection: d3.Selection<any>, beforeSelection: string, padding: number) {
    return toSelection.insert("rect", beforeSelection)
        .datum(function() { return this.nextSibling.getBBox(); })
        .attr('x', d => d.x - padding)
        .attr('y', d => d.y - padding)
        .attr('width', d => d.width + 2 * padding)
        .attr('height', d => d.height + 2 * padding);
}

d3.json('data.json', (err, data: allData) => {
    var newQuestions = d3.select("#questionContainer").selectAll("div.question")
        .data(data.questions, d => d.key).enter()
        .append('div')
            .attr('class', 'question')
            .attr('id', d => d.key + "div");
        
    newQuestions.append("h3")
        .html(d => d.title);
        
    newQuestions.append('h4')
        .html(d => d.desc);
        
        
    var height = 400;
    var width = 800;
    var margin = {left: 45, bottom: 25};
    
    var svg = newQuestions.append('svg')
        .attr('id', d => d.key)
        .attr('width', width)
        .attr('height', height + 100);

    var barHeight = d3.scale.linear().domain([0, 731]).range([height, margin.bottom]);
    var yaxis = d3.svg.axis()
        .scale(barHeight)
        .orient("left")
        .innerTickSize(-width)
        .outerTickSize(0)
        .tickPadding(10);
    
    // have to use function to avoid reassigning `this` to some TS-specific thing
    svg.each(function(qd, i) {   
        var thisSVG = d3.select(this);
        
        thisSVG.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(45,-' + margin.bottom + ')')
            .call(yaxis);
        
        var barBands = d3.scale.ordinal()
            .domain(qd.data.map(e => e.key.toString()))
            .rangeRoundBands([margin.left, 600], 0.2, 0.1);
            
        var colorScale = d3.scale.ordinal<string>()
            .domain(qd.data.map(d => d.key.toString()));
        switch (qd.data.length) {
            case 2:
                colorScale.range(colorbrewer.RdYlBu[3].filter((d, i) => i % 2 == 0));
                break;
            case 5: 
                colorScale.range(colorbrewer.BrBG[5]);
                break;
            case 6:
                colorScale.range(colorbrewer.BrBG[6]);
                break;
            case 7:
                colorScale.range(colorbrewer.BrBG[7]);
                break;
            default:
                colorScale.range(['steelblue']);
        }
        
        // short-circuit colorScale for non-diverging scales
        if (["env6", "env1"].filter(v => v == qd.key).length != 0)
            colorScale.range(colorbrewer.BuGn[7]);
        if (qd.key == "league_aware1")
            colorScale.range(colorbrewer.BuGn[5]);
            
        var barGroup = thisSVG.selectAll('g.bars')
            .data(qd.data, d => d.key.toString()).enter()
            .append('g')
                .attr('class', 'bars')
                .attr('transform', d => 'translate(' + barBands(d.key.toString()) + ',0)');
                
        barGroup.append('rect')
            //.attr('x', (d, i) => barBands(d.name))
            .attr('y', d => barHeight(d.value) - margin.bottom)
            .attr('width', barBands.rangeBand())
            .attr('height', d => height - barHeight(d.value))
            .style('fill', d => colorScale(d.key.toString()));
            
        barGroup.append('text')
            .attr('class', 'label')
            .attr('y', d => barHeight(d.value) - margin.bottom)
            .attr('x', barBands.rangeBand() / 2)
            .attr('dy', '-0.7em')
            .style('text-anchor', 'middle')
            .text(d => d.value);
            
        barGroup.append('text')
            .attr('class', 'categ')
            .attr('y', height)
            .attr('dy', '0.71em')
            .attr('transform', 'translate(' + barBands.rangeBand() / 2 + ',0)')
            .text(d => d.name.trim())
            .call(wrap, barBands.rangeBand());
    });
    
    var newANOVA = d3.select("#anovaContainer").selectAll("div.anova")
        .data(data.ANOVA, d => d.key).enter()
        .append('div')
            .attr('class', 'anova')
            .attr('id', d => d.key + "div");   
            
    newANOVA.append('h3').html(d => d.title);
    newANOVA.append('h4').html(d => d.desc);     
    
    var svgANOVA = newANOVA.append('svg')
        .attr('id', d => d.key)
        .attr('width', width)
        .attr('height', height + 100);
    
    barHeight.domain([0, 7.5]);
    yaxis.scale(barHeight);
    var errorLineHeight = 20;
    
    var errorScale = d3.scale.linear().range([0, 375]).domain([0, 7.5])
    
    svgANOVA.each(function(ad, i) {
        var thisSVG = d3.select(this);
        thisSVG.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(45,-' + margin.bottom + ')')
            .call(yaxis);
            
        var barBands = d3.scale.ordinal()
            .domain(ad.data.map(d => d.key))
            .rangeRoundBands([margin.left, 600], 0.2, 0.1);
        var colorScale = d3.scale.ordinal<string>()
            .domain(ad.data.map(d => d.key))
            .range(colorbrewer.Paired[4]);
            
        var barGroup = thisSVG.selectAll('g.bars')
            .data(ad.data, d => d.key)
            .enter().append('g')
                .attr('class', 'bars')
                .attr('transform', d => 'translate(' + barBands(d.key) + ',0)');
                
        barGroup.append('rect')
            .attr('y', d => barHeight(d.mean) - margin.bottom)
            .attr('width', barBands.rangeBand())
            .attr('height', d => height - barHeight(d.mean))
            .style('fill', d => colorScale(d.key));
            
        barGroup.append('line')
            .attr('y1', d => barHeight(d.mean) -margin.bottom- errorScale(d.stderr))
            .attr('y2', d => barHeight(d.mean) -margin.bottom+ errorScale(d.stderr))
            .attr('x1', barBands.rangeBand() / 2) 
            .attr('x2', barBands.rangeBand() / 2)
            .style('stroke', "red")
            .style('stroke-width', 3);
            
            
        barGroup.append('text')
            .attr('class', 'categ')
            .attr('y', height)
            .attr('dy', '0.71em')
            .attr('transform', 'translate(' + barBands.rangeBand() / 2 + ',0)')
            .text(d => d.name.trim())
            .call(wrap, barBands.rangeBand());
            
        var minPval = 0.001;
        var minSigY = barHeight(d3.max(ad.data, d => d.mean)) - margin.bottom - (ad.significance.length * 20) - 20;
        var sigGroup = thisSVG.selectAll('g.sigs')
            .data(ad.significance, d => d.between.join(""))
            .enter().append('g')
                .attr('class', 'sigs')
                .attr('transform', (d, i) => 'translate(0,' + (minSigY + (i * 20 + 10)) + ')');
                
        sigGroup.append('path')
            .attr('class', 'sigLine')
            .attr('d', d => {
               var path = "M" + (barBands(d.between[0]) + barBands.rangeBand() / 2) + ",7l0,-7";
               path += "L" + (barBands(d.between[1]) + barBands.rangeBand() / 2) + ",0l0,7";
               return path;
            });
            
        sigGroup.append("text")
            .attr('class', 'sigLabel')
            .style('fill', d => d.p_value <= 0.05 ? 'red' : '#666')
            .attr('font-size', '11')
            .attr('x', d => (barBands(d.between[0]) + barBands(d.between[1])) / 2 + barBands.rangeBand() / 4)
            .attr('dy', '0.35em')
            .text(d => {
                if (d.p_value < minPval)
                    return "p < 0.001";
                return "p = " + d.p_value
            });
            
        addBackingRect(sigGroup, 'text', 3);
    });
    
    var teamMouseover = function(d) {
        d3.selectAll('.team').sort((a, b) => a.key == d.key ? 1 : -1)
        d3.selectAll('.flair-' + d.key).style('opacity', 1);
        d3.select('.team-' + d.key + " > g.teamlabel").style('opacity', 1);  
        d3.select('.team-' + d.key + " > line").style('stroke', '#f00');
        d3.select('.team-' + d.key + " > .bandwagon").style('opacity', 1)
   };
   
   var teamMouseout = function(d) {
        d3.selectAll('.flair-' + d.key).style('opacity', null);  
        d3.select('.team-' + d.key + " > g.teamlabel").style('opacity', 0);
        d3.select('.team-' + d.key + " > line").style('stroke', '#aaa');
        d3.select('.team-' + d.key + " > .bandwagon").style('opacity', 0)
   };
    
    d3.select("#teamContainer")
        .append('div')
            .attr('class', "teamimgs")
        .selectAll("span.flair")
        .data(data.teams.sort((a,b) => b.favorite - a.favorite), d => d.key).enter()
            .append('span')
            .attr('class', d => 'flair flair-' + d.key)
            .on('mouseover', teamMouseover)
            .on('mouseout', teamMouseout);
    
    var teamSVG = d3.select("#teamContainer").append('svg')    
        .attr("id", "teams")
        .attr('width', 540)
        .attr('height', 900);
                
   d3.select("#teamContainer")
        .append('div')
            .attr('class', "teamimgs")
            .style('margin-left', '20px')
        .selectAll("span.flair")
        .data(data.teams.sort((a,b) => b.rooting - a.rooting), d => d.key).enter()
            .append('span')
            .attr('class', d => 'flair flair-' + d.key)
            .on('mouseover', teamMouseover)
            .on('mouseout', teamMouseout);

    var colors = ['#66c2a5', '#fc8d62'];
    var maxVal = Math.max(d3.max(data.teams, d => d.rooting), d3.max(data.teams, d => d.favorite));
    var teamHeight = d3.scale.linear()
        .domain([0, maxVal]).range([850, margin.bottom]);
    var teamY = d3.svg.axis()
        .orient("left")
        .outerTickSize(0)
        .innerTickSize(-300)
        .tickPadding(10)
        .scale(teamHeight);
    teamSVG.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(210, -' + margin.bottom + ')')
        .call(teamY)
        .select('.domain')
            .style('stroke', colors[0]);
    
    teamY.innerTickSize(0).orient("right");
    teamSVG.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(510, -' + margin.bottom + ')')
        .call(teamY)
        .select('.domain')
            .style('stroke', colors[1]);
        
    teamSVG.append('text')
        .attr('x', 210)
        .attr('y', 850)
        .attr('dy', "0.71em")
        .style('text-anchor', 'middle')
        .style('font-weight', 500)
        .style('fill', colors[0])
        .text('# favorite team');
        
    teamSVG.append('text')
        .attr('x', 510)
        .attr('y', 850)
        .attr('dy', "0.71em")
        .attr('dx', "1.5em")
        .style('text-anchor', 'end')
        .style('font-weight', 500)
        .style('fill', colors[1])
        .text('# rooting for this year');
        
    var newTeams = teamSVG.selectAll('g.team')
        .data(data.teams, d => d.team).enter()
        .append('g')
            .attr('class', d => 'team team-' + d.key)
            .attr('transform', 'translate(0, -' + margin.bottom + ')');

    var newLabels = newTeams.append('g')
        .attr('class', 'teamlabel')
        .style('opacity', 0);             
    
    newLabels.append('text')
        .attr('x', 178)
        .attr('y', d => teamHeight(d.favorite))
        .attr('dy', ".35em")
        .style('text-anchor', 'end')
        .text(d => d.team);
        
    newTeams.append('line')
        .attr('x1', 210)
        .attr('x2', 510)
        .attr('y1', d => teamHeight(d.favorite))
        .attr('y2', d => teamHeight(d.rooting))
        .style('stroke', '#aaa')
        .style('stroke-width', 3)
        .on('mouseover', teamMouseover)
        .on('mouseout', teamMouseout);
        
    var bandwagonLabel = newTeams.append('g')
        .attr('class', 'bandwagon')
        .style('opacity', 0);
        
    bandwagonLabel.append('text')
        .attr('x', 360)
        .attr('y', d => (teamHeight(d.favorite) + teamHeight(d.rooting)) / 2)
        .attr('dy', "-0.5em")
        .style('text-anchor', 'middle')
        .style('font-size', 24)
        .style('font-weight', 500)
        .style('fill', '#f00')
        .text(d => d.rooting - d.favorite);
        
    bandwagonLabel.append('text')   
        .attr('class', 'favlabel')
        .attr('x', 200)
        .attr('y', d => teamHeight(d.favorite))
        .attr('dy', '0.35em')
        .style('text-anchor', 'end')
        .style('fill', colors[0])
        .text(d => d.favorite);
        
    bandwagonLabel.append('text')   
        .attr('class', 'rootlabel')
        .attr('x', 520)
        .attr('y', d => teamHeight(d.rooting))
        .attr('dy', '0.35em')
        .style('fill', colors[1])
        .text(d => d.rooting);

    addBackingRect(bandwagonLabel, ".rootlabel", 6);
    addBackingRect(bandwagonLabel, ".favlabel", 6);
    
});

console.log("blarggghhhh stop looking here!  Check out the GitHub repo instead: https://github.com/yelper/r-nba-survey-results");

