const fs = require('fs');

const readFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(JSON.parse(data));
    });
  });
};

const saveFile = (filePath, jsonData) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
};

(async () => {
  const name = '18t3';
  const filePath = `./${name}.db`;
  const jsonData = await readFile(filePath);
  let consolidated = {};
  
  jsonData.posts.forEach( p =>
  {
	  let featured = new Date(p.featuredAt);
	  let month = ("0" + (featured.getMonth() + 1)).slice(-2);
	  let date = ("0" + featured.getDate()).slice(-2);
	  let hour = ("0" + featured.getHours()).slice(-2);
	  let key = `${featured.getFullYear()}${month}${date}${hour}`; 
	  
	  if (consolidated[key] == null)
		  consolidated[key] = { date: parseInt(`${featured.getFullYear()}${month}${date}`), comments: 0, votes: 0, reviews: 0, day: featured.getDay()+1, hour: featured.getHours()};
	  
	  consolidated[key].comments += p.commentsCount;
	  consolidated[key].votes 	+= p.votesCount;
	  consolidated[key].reviews += p.reviewsCount;
  });

  await saveFile(`./${name}_processed.db`, jsonData);
  console.log('Saved JSON data');
  
  // Create items array
	let items = Object.keys(consolidated).map(function(key) {
	  return [key, consolidated[key]];
	});

	// Sort the array based on the second element
	items.sort(function(first, second) {
	  return second[1] - first[1];
	});
	
	items = items.map(i => i[1]);
	//build series
	let outputData = [];
	for(let i=24;i>0;i--)
	{
		let series = { name: i.toString(), data: []}
		
		for(let j=1;j<=7;j++)
		{
			let f  = items.filter((item) => item.hour == i && item.day == j);
			
			if(f.length == 0){
				series.data.push({x: j.toString(), y: 0})
			}else{
				let sum = f.reduce((total, item) => total + item.votes, 0); 
				series.data.push({x: j.toString(), y: f.length})	 //sum
			}
		}
		outputData.push(series)
	}

	
	

  //console.log(consolidated);

    await saveFile(`./$output.json`, outputData);
})();