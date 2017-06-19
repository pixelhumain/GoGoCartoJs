declare var $;
declare var nunjucks;

import { AppModule, initializeAppModule } from './app.module';

$(document).ready(function()
{
	let carto = new GoGoCarto();
});

export class GoGoCarto
{
	constructor()
	{
		console.log("Gogocarto powaaa !");
		nunjucks.configure('../src/views', { autoescape: true });
		let layout = nunjucks.render('layout.html.njk');
		$('#gogocarto-container').html(layout);
		initializeAppModule();
	}
}