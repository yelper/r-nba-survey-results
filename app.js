/// <reference path="d3.d.ts" />
var colorbrewer;
// with thanks to <http://bl.ocks.org/mbostock/7555321>
// and <http://stackoverflow.com/questions/32804813/converting-javascript-function-to-typescript-including-getcomputedtextlength>
function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this), words = text.text().split(/\s+/).reverse(), word, line = [], lineNumber = 0, lineHeight = 1.1, // ems
        y = text.attr("y"), dy = parseFloat(text.attr("dy")), tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            var node = tspan.node();
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
d3.json('data.json', function (err, data) {
    var newQuestions = d3.select("#questionContainer").selectAll("div.question")
        .data(data.questions, function (d) { return d.key; }).enter()
        .append('div')
        .attr('class', 'question')
        .attr('id', function (d) { return d.key + "div"; });
    newQuestions.append("h3")
        .html(function (d) { return d.title; });
    newQuestions.append('h4')
        .html(function (d) { return d.desc; });
    var height = 400;
    var width = 800;
    var margin = { left: 45, bottom: 25 };
    var svg = newQuestions.append('svg')
        .attr('id', function (d) { return d.key; })
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
    svg.each(function (qd, i) {
        var thisSVG = d3.select(this);
        thisSVG.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(45,-' + margin.bottom + ')')
            .call(yaxis);
        var barBands = d3.scale.ordinal()
            .domain(qd.data.map(function (e) { return e.key.toString(); }))
            .rangeRoundBands([margin.left, 600], 0.2, 0.1);
        var colorScale = d3.scale.ordinal()
            .domain(qd.data.map(function (d) { return d.key.toString(); }));
        switch (qd.data.length) {
            case 2:
                colorScale.range(colorbrewer.RdYlBu[3].filter(function (d, i) { return i % 2 == 0; }));
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
        var barGroup = thisSVG.selectAll('g.bars')
            .data(qd.data, function (d) { return d.key.toString(); }).enter()
            .append('g')
            .attr('class', 'bars')
            .attr('transform', function (d) { return 'translate(' + barBands(d.key.toString()) + ',0)'; });
        barGroup.append('rect')
            .attr('y', function (d) { return barHeight(d.value) - margin.bottom; })
            .attr('width', barBands.rangeBand())
            .attr('height', function (d) { return height - barHeight(d.value); })
            .style('fill', function (d) { return colorScale(d.key.toString()); });
        barGroup.append('text')
            .attr('class', 'label')
            .attr('y', function (d) { return barHeight(d.value) - margin.bottom; })
            .attr('x', barBands.rangeBand() / 2)
            .attr('dy', '-0.7em')
            .style('text-anchor', 'middle')
            .text(function (d) { return d.value; });
        barGroup.append('text')
            .attr('class', 'categ')
            .attr('y', height)
            .attr('dy', '0.71em')
            .attr('transform', 'translate(' + barBands.rangeBand() / 2 + ',0)')
            .text(function (d) { return d.name.trim(); })
            .call(wrap, barBands.rangeBand());
    });
    var newANOVA = d3.select("#anovaContainer").selectAll("div.anova")
        .data(data.ANOVA, function (d) { return d.key; }).enter()
        .append('div')
        .attr('class', 'anova')
        .attr('id', function (d) { return d.key + "div"; });
    newANOVA.append('h3').html(function (d) { return d.title; });
    newANOVA.append('h4').html(function (d) { return d.desc; });
    var svgANOVA = newANOVA.append('svg')
        .attr('id', function (d) { return d.key; })
        .attr('width', width)
        .attr('height', height + 100);
    barHeight.domain([0, 7.5]);
    yaxis.scale(barHeight);
    var errorLineHeight = 20;
    var errorScale = d3.scale.linear().range([0, 375]).domain([0, 7.5]);
    svgANOVA.each(function (ad, i) {
        var thisSVG = d3.select(this);
        thisSVG.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(45,-' + margin.bottom + ')')
            .call(yaxis);
        var barBands = d3.scale.ordinal()
            .domain(ad.data.map(function (d) { return d.key; }))
            .rangeRoundBands([margin.left, 600], 0.2, 0.1);
        var colorScale = d3.scale.ordinal()
            .domain(ad.data.map(function (d) { return d.key; }))
            .range(colorbrewer.Paired[4]);
        var barGroup = thisSVG.selectAll('g.bars')
            .data(ad.data, function (d) { return d.key; })
            .enter().append('g')
            .attr('class', 'bars')
            .attr('transform', function (d) { return 'translate(' + barBands(d.key) + ',0)'; });
        barGroup.append('rect')
            .attr('y', function (d) { return barHeight(d.mean) - margin.bottom; })
            .attr('width', barBands.rangeBand())
            .attr('height', function (d) { return height - barHeight(d.mean); })
            .style('fill', function (d) { return colorScale(d.key); });
        barGroup.append('line')
            .attr('y1', function (d) { return barHeight(d.mean) - margin.bottom - errorScale(d.stderr); })
            .attr('y2', function (d) { return barHeight(d.mean) - margin.bottom + errorScale(d.stderr); })
            .attr('x1', barBands.rangeBand() / 2)
            .attr('x2', barBands.rangeBand() / 2)
            .style('stroke', "red")
            .style('stroke-width', 3);
        barGroup.append('text')
            .attr('class', 'categ')
            .attr('y', height)
            .attr('dy', '0.71em')
            .attr('transform', 'translate(' + barBands.rangeBand() / 2 + ',0)')
            .text(function (d) { return d.name.trim(); })
            .call(wrap, barBands.rangeBand());
        var minPval = 0.001;
        var minSigY = barHeight(d3.max(ad.data, function (d) { return d.mean; })) - margin.bottom - (ad.significance.length * 20) - 20;
        var sigGroup = thisSVG.selectAll('g.sigs')
            .data(ad.significance, function (d) { return d.between.join(""); })
            .enter().append('g')
            .attr('class', 'sigs')
            .attr('transform', function (d, i) { return 'translate(0,' + (minSigY + (i * 20 + 10)) + ')'; });
        sigGroup.append('path')
            .attr('class', 'sigLine')
            .attr('d', function (d) {
            var path = "M" + (barBands(d.between[0]) + barBands.rangeBand() / 2) + ",7l0,-7";
            path += "L" + (barBands(d.between[1]) + barBands.rangeBand() / 2) + ",0l0,7";
            return path;
        });
        sigGroup.append("text")
            .attr('class', 'sigLabel')
            .style('fill', function (d) { return d.p_value <= 0.05 ? 'red' : '#666'; })
            .attr('font-size', '11')
            .attr('x', function (d) { return (barBands(d.between[0]) + barBands(d.between[1])) / 2 + barBands.rangeBand() / 4; })
            .attr('dy', '0.35em')
            .text(function (d) {
            if (d.p_value < minPval)
                return "p < 0.001";
            return "p = " + d.p_value;
        });
        // with thanks to <http://bl.ocks.org/mbostock/4b66c0d9be9a0d56484e>
        var labelPadding = 3;
        sigGroup.insert("rect", "text")
            .datum(function () { return this.nextSibling.getBBox(); })
            .attr('x', function (d) { return d.x - labelPadding; })
            .attr('y', function (d) { return d.y - labelPadding; })
            .attr('width', function (d) { return d.width + 2 * labelPadding; })
            .attr('height', function (d) { return d.height + 2 * labelPadding; });
    });
    var teamMouseover = function (d) {
        d3.selectAll('.flair-' + d.key).style('opacity', 1);
        d3.select('.team-' + d.key + " > g.teamlabel").style('opacity', 1);
        d3.select('.team-' + d.key + " > line").style('stroke', '#f00');
    };
    var teamMouseout = function (d) {
        d3.selectAll('.flair-' + d.key).style('opacity', null);
        d3.select('.team-' + d.key + " > g.teamlabel").style('opacity', 0);
        d3.select('.team-' + d.key + " > line").style('stroke', '#aaa');
    };
    d3.select("#teamContainer")
        .append('div')
        .attr('class', "teamimgs")
        .selectAll("span.flair")
        .data(data.teams.sort(function (a, b) { return b.favorite - a.favorite; }), function (d) { return d.key; }).enter()
        .append('span')
        .attr('class', function (d) { return 'flair flair-' + d.key; })
        .on('mouseover', teamMouseover)
        .on('mouseout', teamMouseout);
    var teamSVG = d3.select("#teamContainer").append('svg')
        .attr("id", "teams")
        .attr('width', 500)
        .attr('height', 900);
    d3.select("#teamContainer")
        .append('div')
        .attr('class', "teamimgs")
        .style('margin-left', '20px')
        .selectAll("span.flair")
        .data(data.teams.sort(function (a, b) { return b.rooting - a.rooting; }), function (d) { return d.key; }).enter()
        .append('span')
        .attr('class', function (d) { return 'flair flair-' + d.key; })
        .on('mouseover', teamMouseover)
        .on('mouseout', teamMouseout);
    var maxVal = Math.max(d3.max(data.teams, function (d) { return d.rooting; }), d3.max(data.teams, function (d) { return d.favorite; }));
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
        .attr('transform', 'translate(175, -' + margin.bottom + ')')
        .call(teamY);
    teamY.innerTickSize(0).orient("right");
    teamSVG.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(475, -' + margin.bottom + ')')
        .call(teamY);
    teamSVG.append('text')
        .attr('x', 175)
        .attr('y', 850)
        .attr('dy', "0.71em")
        .style('text-anchor', 'middle')
        .text('# favorite team');
    teamSVG.append('text')
        .attr('x', 475)
        .attr('y', 850)
        .attr('dy', "0.71em")
        .attr('dx', "1.5em")
        .style('text-anchor', 'end')
        .text('# rooting for this year');
    var newTeams = teamSVG.selectAll('g.team')
        .data(data.teams, function (d) { return d.team; }).enter()
        .append('g')
        .attr('class', function (d) { return 'team team-' + d.key; })
        .attr('transform', 'translate(0, -' + margin.bottom + ')');
    var newLabels = newTeams.append('g')
        .attr('class', 'teamlabel')
        .style('opacity', 0);
    newLabels.append('text')
        .attr('x', 170)
        .attr('y', function (d) { return teamHeight(d.favorite); })
        .attr('dy', ".35em")
        .style('text-anchor', 'end')
        .text(function (d) { return d.team; });
    var labelPadding = 3;
    newLabels.insert("rect", "text")
        .datum(function () { return this.nextSibling.getBBox(); })
        .attr('x', function (d) { return d.x - labelPadding; })
        .attr('y', function (d) { return d.y - labelPadding; })
        .attr('width', function (d) { return d.width + 2 * labelPadding; })
        .attr('height', function (d) { return d.height + 2 * labelPadding; });
    newTeams.append('line')
        .attr('x1', 175)
        .attr('x2', 475)
        .attr('y1', function (d) { return teamHeight(d.favorite); })
        .attr('y2', function (d) { return teamHeight(d.rooting); })
        .style('stroke', '#aaa')
        .style('stroke-width', 3)
        .on('mouseover', teamMouseover)
        .on('mouseout', teamMouseout);
});
console.log("asdfasdfasdf!");
//# sourceMappingURL=app.js.map