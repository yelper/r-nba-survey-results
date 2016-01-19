# /r/nba Survey on Online Community 

This repo contains the files necessary to display the results for the /r/nba Survey on Online Community, [administered in late 2015 to subreddit participants](https://www.reddit.com/r/nba/comments/3tuvh6/help_me_understand_online_communication_in_rnba/).  731 participants responded with answers to questions on five different scales.  

Two independent variables collected from each respondent (in a between-subjects survey design) were talking about basketball with people in real-life (at least once a week) and being a part of other online communities (e.g. social media, gaming, forums).  There was an uneven skew toward talking about basketball in daily life (668 yes to 63 no).  Regardless, significant results in the two-way ANOVA were found, and are detailed at the bottom of the results webpage (`index.html`).

This survey was administered to complete the requirements for the survey and data analysis assignments for CS 770 (Research Methods in HCI) at the University of Wisconsin-Madison in Fall 2015.

### Building

The JavaScript code is written in TypeScript and files are included to build the `.ts` file with [Visual Studio Code](https://code.visualstudio.com/).  To build the code, clone this repository, open the folder in VSC, make your edits to `app.ts`, press CTRL+SHIFT+B to build the code into JavaScript.  Navigate to `index.html` from a booted webserver (e.g. `python -m SimpleHTTPServer`).

### Credits

* /r/nba for the small team icons (images and CSS)
