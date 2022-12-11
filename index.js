const express = require('express'); //Import the express dependency
const app = express();              //Instantiate an express app, the main work horse of this server
const port = process.env.PORT || 3001;

app.set('view engine', 'pug');

const calcScoreForRoster = (roster) => {
	var score = 0;
	for (let index = 0; index < roster.length; index++) {
		const player = roster[index];
		if(player.position != 'Bench') {
			score += player.totalPoints;
		}		
	}
	return parseFloat(score.toFixed(2));
}

//Idiomatic expression in express to route and respond to a client request
app.get('/', (req, res) => {        //get requests to the root ("/") will route here
    
	const espnS2 = process.env.espnS2;
	const SWID = process.env.SWID;

	const { Client } = require('espn-fantasy-football-api/node-dev');
	const myClient = new Client({ leagueId: 735721 });
	myClient.setCookies({ 
		espnS2,
		SWID 
	});
	
	var data = myClient.getBoxscoreForWeek({
		seasonId: 2022,
		matchupPeriodId: 13,
		scoringPeriodId: 14,
	}).then((result) => {
		var ethanScore = 0;
		var nealScore = 0;
		result.forEach(el => {
			if(el.homeTeamId == 2) {
				ethanScore += calcScoreForRoster(el.homeRoster);
			} else if(el.awayTeamId == 2) {
				ethanScore += calcScoreForRoster(el.awayRoster);
			} else if(el.homeTeamId == 5) {
				nealScore += calcScoreForRoster(el.homeRoster);
			} else if(el.awayTeamId == 5) {
				nealScore += calcScoreForRoster(el.awayRoster);
			}
		});
		res.render('index', { 
			title: 'Hey', 
			message: 'Hello there!',
			nealScore,
			ethanScore,
			data: result,
		})
	})
});

app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Now listening on port ${port}`); 
});