//written by Bubble
//Only works for mystic's titanic favor,
const Command = require('command');
const TITANIC_FAVOR = 67159864;


module.exports = function BlockLockons(dispatch) {
	const command = Command(dispatch);
	let slaying = false;
	let ignore = [];
	let partyMembers = [];
	let pid;
	
	dispatch.hook('S_LOGIN', 7, event => {	
		if(7 != ((event.model - 10101) % 100)) { //not mystic
			slaying = false;	
			ignore = [];
			return;
		}
		pid = event.playerId;
    });
	
	dispatch.hook('C_CAN_LOCKON_TARGET', 1, {order: -1001}, event => { //silence client lockons on slaying target
		if(slaying && event.skill == TITANIC_FAVOR) {
			for(var i = 0; i < ignore.length; i++) {
				if(event.target - ignore[i].cid === 0) {
					return false;
				}
			}
		}
	});
	
	dispatch.hook('S_PARTY_MEMBER_LIST', 5, (event) => {
		partyMembers = [];
		for(let pMember of event.members) {
			if(pMember.playerId !== pid) {
				partyMembers.push({
					cid: pMember.cid,
					playerId: pMember.playerId,
					name: pMember.name
				});
			}
		}
    });
	
	//clear party list if leaving party
    dispatch.hook('S_LEAVE_PARTY', 1, (event) => {
		partyMembers = [];	
		ignore = [];
    });
	
	function ignorePlayer(name) {
		for(let pMember of partyMembers) {
			if(name.toUpperCase() === pMember.name.toUpperCase()) {	//check if target is in party
				for(var i = 0; i < ignore.length; i++) {	//check if target is already in ignore
					if(pMember.cid - ignore[i].cid === 0) {
						ignore.splice(i, 1);
						return("Removed player: " + pMember.name + ".");
					}
				}
				ignore.push({cid:pMember.cid});
				return("Added player " + pMember.name + ".");
			}
		}
		return("Target not in party. Party size: " + (partyMembers.length + 1));
	}
	
	command.add('slaying', () => {
		slaying = !slaying;
		if(!slaying) {	//deactivating clears list
			ignore = [];
		}
		command.message('Slaying '+(slaying?'enabled':'disabled and cleared slaying list')+'.');
	});
	
	command.add('slayingPlayer', (name) => {
		if(!slaying) {	//activates slaying if adding someone 
			slaying = true;
		}
		command.message(ignorePlayer(name));
	})
}
