// Bible Stories Seed Data - Extended Full Stories
// Use this data for the Mowdministries app Bible Stories section

export interface BibleStory {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  fullStory: string; // NEW: Complete narrative version
  image: string;
  bookId: string;
  startChapter: number;
  endChapter: number;
  startVerse?: number;
  endVerse?: number;
  reference: string;
  category: 'old_testament' | 'new_testament';
  themes: string[];
  characters: string[];
  lesson: string;
  readTime: string;
}

export const BIBLE_STORIES: BibleStory[] = [
  {
    id: '1',
    title: 'Creation',
    subtitle: 'God Creates the World',
    description: 'In the beginning, God created the heavens and the earth. Over six days, He formed light, sky, land, seas, plants, sun, moon, stars, sea creatures, birds, animals, and finally mankind in His own image.',
    fullStory: `In the very beginning, before time existed, before anything was created, there was only God. The earth was formless and empty, covered in darkness, with deep waters stretching endlessly. It was a void—silent, dark, and waiting. The Spirit of God hovered over the surface of these waters, preparing to bring forth something magnificent from nothing.

Then God spoke. His voice thundered through the emptiness: "Let there be light!" And instantly, brilliantly, light exploded into existence, piercing through the darkness. It was the first thing ever created, and God looked upon it and saw that it was good. He separated the light from the darkness, calling the light "day" and the darkness "night." Evening passed, morning came—the first day of creation was complete.

On the second day, God said, "Let there be a space between the waters, to separate the waters of the heavens from the waters of the earth." So God made an expanse, a great sky that held back the waters above from the waters below. He called this expanse "sky" or "heaven." It was a vast, beautiful canopy that would one day hold clouds and weather, separating the cosmic waters from the earthly seas. Evening passed, and morning came—the second day.

On the third day, God spoke again: "Let the waters beneath the sky flow together into one place, so dry ground may appear." And it happened just as He commanded. The waters rushed together, gathering into seas and oceans, and dry land rose up from beneath. God called the dry ground "land" and the gathered waters "seas." He looked at what He had made and saw that it was good.

But God wasn't finished with the third day. He said, "Let the land sprout with vegetation—every sort of seed-bearing plant, and trees that grow seed-bearing fruit. These seeds will then produce the kinds of plants and trees from which they came." And suddenly, the barren land transformed. Grass pushed through the soil, flowers bloomed in brilliant colors, bushes spread their branches, and towering trees reached toward the sky. Plants of every imaginable variety covered the earth, each designed to reproduce according to its kind. God looked at the lush, green earth and saw that it was very good. Evening passed, and morning came—the third day.

On the fourth day, God said, "Let lights appear in the sky to separate the day from the night. Let them be signs to mark the seasons, days, and years. Let these lights in the sky shine down on the earth." So God made two great lights—the sun and the moon. The greater light, the sun, would govern the day, providing warmth and light for all living things. The lesser light, the moon, would govern the night, reflecting the sun's glory in the darkness. God also made the countless stars, each one placed with purpose, forming constellations that would guide travelers and inspire wonder for generations to come. He set all these lights in the sky to give light to the earth, to govern the day and night, and to separate the light from the darkness. God saw that it was good. Evening passed, and morning came—the fourth day.

On the fifth day, God filled the waters and the skies with life. He said, "Let the waters swarm with fish and other life. Let the skies be filled with birds of every kind." So God created great sea creatures and every living thing that scurries and swarms in the water—from the tiniest fish to the massive creatures of the deep. He made birds of every type—soaring eagles, swift falcons, colorful parrots, and gentle doves. Each creature was perfectly designed for its environment, with instincts and abilities beyond human comprehension.

God blessed them all, saying, "Be fruitful and multiply. Let the fish fill the seas, and let the birds multiply on the earth." It was a command and a promise—life would continue, generation after generation. God looked at the teeming waters and the birds filling the air, and He saw that it was good. Evening passed, and morning came—the fifth day.

On the sixth day, God said, "Let the earth produce every sort of animal, each producing offspring of the same kind—livestock, small animals that scurry along the ground, and wild animals." And it happened. God made all sorts of wild animals, livestock, and small animals, each able to produce offspring of the same kind. Lions roared, elephants trumpeted, horses galloped across plains, cattle grazed peacefully, and countless smaller creatures scurried about. The earth was now bursting with life—in the seas, in the air, and on the land.

Then God said something extraordinary: "Let us make human beings in our image, to be like us. They will reign over the fish in the sea, the birds in the sky, the livestock, all the wild animals on the earth, and the small animals that scurry along the ground."

So God created human beings in His own image. In the image of God He created them; male and female He created them. Unlike the animals, humans were made to reflect God's character—to think, to choose, to love, to create, and to have relationship with their Creator. They were given dignity and purpose beyond any other creature.

God blessed them and said, "Be fruitful and multiply. Fill the earth and govern it. Reign over the fish in the sea, the birds in the sky, and all the animals that scurry along the ground." Then God said, "Look! I have given you every seed-bearing plant throughout the earth and all the fruit trees for your food. And I have given every green plant as food for all the wild animals, the birds in the sky, and the small animals that scurry along the ground—everything that has life." And that is what happened.

God looked over everything He had made, and He saw that it was not just good—it was very good! Perfect. Beautiful. Complete. Everything was in harmony—animals at peace, plants thriving, humans in perfect fellowship with God. There was no sin, no death, no pain, no sorrow. Just perfection. Evening passed, and morning came—the sixth day.

On the seventh day, God's work of creation was complete. He had finished everything He had planned to make. So on the seventh day, God rested from all His work. This wasn't because He was tired—God never grows weary—but because His work was finished. He blessed the seventh day and made it holy, setting it apart as a day of rest. It was a pattern He would give to humanity: six days of work, one day of rest, a rhythm of life that honors both productivity and restoration.

The heavens and the earth were complete, along with everything in them. God had spoken, and it all came into being. He had created an entire universe from nothing, designing every detail with wisdom and purpose. And at the center of it all, He placed humanity—not as an afterthought, but as His masterpiece, made in His own image to know Him, love Him, and reflect His glory throughout all creation.`,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    bookId: 'GEN',
    startChapter: 1,
    endChapter: 2,
    reference: 'Genesis 1-2',
    category: 'old_testament',
    themes: ['Creation', 'God\'s Power', 'Purpose', 'Beginning'],
    characters: ['God', 'Adam', 'Eve'],
    lesson: 'God is the creator of all things and made humanity in His image with purpose and love.',
    readTime: '10 min',
  },
  {
    id: '2',
    title: 'Noah\'s Ark',
    subtitle: 'The Great Flood',
    description: 'God saw that wickedness had filled the earth and decided to send a great flood. He chose Noah, a righteous man, to build an ark and save his family along with pairs of every animal. After 40 days of rain, the waters receded and God made a covenant with Noah, setting a rainbow in the sky.',
    fullStory: `As generations passed after creation, people multiplied across the earth. Cities grew, civilizations developed, and humanity spread to every corner of the world. But something went terribly wrong. Instead of loving and honoring God, people turned away from Him. Violence filled the streets, corruption infected every level of society, and wickedness became the norm rather than the exception.

God looked down upon the earth He had created with such care and love, and His heart was deeply troubled. The humans He had made in His own image—designed for relationship with Him—had chosen evil continuously. Every inclination of their hearts was only evil all the time. The earth was corrupt in God's sight and filled with violence. God saw how corrupt the earth had become, for all the people on earth had corrupted their ways.

It grieved the Lord that He had made human beings on the earth, and His heart was filled with pain. The beautiful world He had spoken into existence, the masterpiece He had called "very good," had been ruined by human sin. God said, "I will wipe this human race I have created from the face of the earth. Yes, and I will destroy every living thing—all the people, the large animals, the small animals that scurry along the ground, and even the birds of the sky. I am sorry I ever made them."

But in all the earth, there was one man who stood out from the rest—Noah. Noah was a righteous man, the only blameless person living on earth at that time. In a world that had abandoned God, Noah walked faithfully with Him. He lived with integrity, raised his family to honor the Lord, and refused to be swept away by the corruption around him. God looked upon Noah with favor.

One day, God spoke to Noah: "I have decided to destroy all living creatures, for they have filled the earth with violence. Yes, I will wipe them all out along with the earth! But I will confirm my covenant with you. You and your family will be saved."

Then God gave Noah an extraordinary command: "Build a large boat from cypress wood and waterproof it with tar, inside and out. Make it 450 feet long, 75 feet wide, and 45 feet high. Leave an 18-inch opening below the roof all the way around the boat. Put the door on the side, and build three decks inside the boat—lower, middle, and upper."

Noah must have been stunned. There had never been rain before—the earth was watered by mist from the ground. A flood of the entire earth would have seemed impossible. Yet Noah didn't argue or question. He simply trusted God and obeyed.

God continued with His instructions: "Look! I am about to cover the earth with a flood that will destroy every living thing that breathes. Everything on earth will die. But I will confirm my covenant with you. So enter the boat—you and your wife and your sons and their wives. Bring a pair of every kind of animal—a male and a female—into the boat with you to keep them alive during the flood. Pairs of every kind of bird, and every kind of animal, and every kind of small animal that scurries along the ground, will come to you to be kept alive. And be sure to take on board enough food for your family and for all the animals."

So Noah did everything exactly as God had commanded him. He began building the ark—this massive boat in the middle of dry land, far from any ocean. Can you imagine what his neighbors thought? They must have mocked him, called him crazy, laughed at this old man building a giant boat when there wasn't even any rain. But Noah kept building, day after day, year after year, for 120 years. He hammered and sawed, gathered supplies, and prepared for what God had promised would come.

Finally, after decades of faithful work, the ark was complete. It was massive—about 1.5 football fields long, a four-story tall wooden vessel that could hold thousands of animals. And just as God had promised, the animals began to come. They came by instinct, guided by God Himself—pairs of every kind of bird, animal, and creature that moves along the ground. They walked, flew, crawled, and climbed into the ark. Clean animals came in groups of seven, unclean animals in pairs. Noah and his sons—Shem, Ham, and Japheth—along with their wives, gathered food and supplies.

When everyone and everything was aboard, God Himself shut the door. It was the last chance for others to turn back to God and be saved, but no one else came. Noah, his wife, his three sons and their wives—just eight people—were all who entered the ark. Then the sky darkened.

Seven days later, when Noah was 600 years old, on the seventeenth day of the second month, all the underground waters erupted from the earth, and the rain fell in mighty torrents from the sky. The windows of heaven were opened. For forty days and forty nights, rain pounded down on the earth. The flood waters rose higher and higher until even the highest mountains were covered—the water rose more than twenty-two feet above the highest peaks.

All the living things on earth died—birds, domestic animals, wild animals, small animals, and all the people. Everything that breathed and lived on dry land died. God wiped out every living thing on the earth—people, livestock, small animals, and birds of the sky. All were destroyed. The only people who survived were Noah and those with him in the boat. And the floodwaters covered the earth for 150 days.

But God didn't forget Noah and the animals in the ark. He sent a wind to blow across the earth, and the floodwaters began to recede. The underground waters stopped flowing, and the torrential rains from the sky were stopped. The water gradually receded from the earth. After 150 days, exactly five months from the time the flood began, the ark came to rest on the mountains of Ararat.

Two and a half months later, the tops of other mountains became visible. After another forty days, Noah opened the window and released a raven. The bird flew back and forth until the floodwaters had dried up. He also released a dove to see if the water had receded, but the dove could find no place to land because the water still covered the ground. So it returned to the ark, and Noah reached out and brought it back inside.

After waiting another seven days, Noah released the dove again. This time the dove returned to him in the evening with a fresh olive leaf in its beak! Noah knew that the waters had receded significantly. He waited another seven days and released the dove again, but this time it did not come back.

Finally, Noah removed the covering of the ark and saw that the surface of the ground was drying. Two more months passed before the earth was completely dry. Then God spoke to Noah: "Leave the boat, all of you—you and your wife, and your sons and their wives. Release all the animals—the birds, the livestock, and the small animals that scurry along the ground—so they can be fruitful and multiply throughout the earth."

So Noah and his family left the ark, along with all the animals—the birds, the livestock, and the small animals came out of the boat, pair by pair. They had been on the ark for just over a year—through the entire flood and the months of waiting for the earth to dry.

The first thing Noah did was build an altar to the Lord. He took some of the clean animals and birds and sacrificed them as burnt offerings on the altar. This was an act of worship, gratitude, and dedication. The Lord was pleased with the aroma of the sacrifice and said to Himself, "I will never again curse the ground because of the human race, even though everything they think or imagine is bent toward evil from childhood. I will never again destroy all living things."

Then God blessed Noah and his sons and told them, "Be fruitful and multiply. Fill the earth. I hereby give you my covenant: Never again will floodwaters kill all living creatures; never again will a flood destroy the earth."

God said, "I am giving you a sign of my covenant with you and with all living creatures, for all generations to come. I have placed my rainbow in the clouds. It is the sign of my covenant with you and with all the earth. When I send clouds over the earth, the rainbow will appear in the clouds, and I will remember my covenant with you and with all living creatures. Never again will the floodwaters destroy all life. When I see the rainbow in the clouds, I will remember the eternal covenant between God and every living creature on earth."

And to this day, whenever rain falls and sunlight breaks through the clouds, we see that rainbow—a beautiful reminder of God's faithfulness, His mercy, and His promises that endure forever. Noah's faith saved his family, and God's covenant with Noah extended to all humanity for all time.`,
    image: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=400',
    bookId: 'GEN',
    startChapter: 6,
    endChapter: 9,
    reference: 'Genesis 6-9',
    category: 'old_testament',
    themes: ['Obedience', 'Faith', 'Salvation', 'Covenant'],
    characters: ['God', 'Noah', 'Noah\'s Family'],
    lesson: 'God rewards faithfulness and obedience, and He always keeps His promises.',
    readTime: '15 min',
  },
  {
    id: '3',
    title: 'David and Goliath',
    subtitle: 'A Giant Victory',
    description: 'The Philistine army challenged Israel with their champion, a giant named Goliath. While all of Israel\'s soldiers were afraid, a young shepherd boy named David stepped forward with only a sling and five stones, trusting in God. With one stone, David defeated the giant.',
    fullStory: `The nation of Israel was at war with the Philistines, their longtime enemies. The two armies faced each other across the Valley of Elah, camped on opposite hillsides with a valley between them. The Israelite army, led by King Saul, was terrified and demoralized. And they had good reason to be afraid.

Each day, a champion came out from the Philistine camp—a giant of a man named Goliath from the city of Gath. He stood over nine feet tall, a towering figure that struck fear into the hearts of even the bravest soldiers. He wore bronze armor weighing 125 pounds, bronze leg armor, and carried a bronze javelin on his back. His spear shaft was as thick as a weaver's beam, and its iron point weighed 15 pounds. An armor bearer walked ahead of him carrying his shield.

Every morning and evening for forty days, Goliath stood and shouted his challenge to the army of Israel: "Why are you all coming out to fight? I am the Philistine champion, but you are only the servants of Saul. Choose one man to come down here and fight me! If he kills me, then we will be your slaves. But if I kill him, you will be our slaves! I defy the armies of Israel today! Send me a man who will fight me!" His voice echoed across the valley like thunder, and every time he shouted, the men of Israel trembled with fear.

Meanwhile, in the small town of Bethlehem, a teenage shepherd boy named David was tending his father's sheep. David was the youngest of eight sons of Jesse, a respected man in Bethlehem. While David's three oldest brothers—Eliab, Abinadab, and Shimea—had joined Saul's army to fight, David stayed home, moving back and forth between tending sheep and occasionally serving King Saul by playing the harp to soothe the king's troubled spirit.

One day, Jesse said to David, "Take this basket of roasted grain and these ten loaves of bread, and carry them quickly to your brothers in the camp. And give these ten cuts of cheese to their captain. See how your brothers are getting along, and bring back a report on how they are doing." Jesse was concerned about his sons and wanted news from the battlefield.

So David left the sheep with another shepherd and set out early the next morning with the gifts. He arrived at the camp just as the Israelite army was leaving for the battlefield with shouts and battle cries. The armies took their positions, facing each other across the valley. David left his things with the keeper of supplies and hurried out to find his brothers to greet them.

As David was talking with his brothers, he heard a familiar booming voice. Goliath, the Philistine champion from Gath, was stepping forward from the Philistine ranks to shout his usual defiance. But this time, David heard the actual words: "I defy the armies of Israel! Send me a man who will fight me!" The young shepherd watched in shock as all the Israelite soldiers ran away in fear, absolutely terrified.

The soldiers were talking among themselves: "Have you seen this man who keeps coming out? He comes out to defy Israel. The king has offered a huge reward to whoever kills him. He will give that man one of his daughters for a wife, and the man's entire family will be exempted from paying taxes!"

David turned to the soldiers standing nearby and asked, "What will a man get for killing this Philistine and ending his defiance of Israel? Who is this pagan Philistine anyway, that he is allowed to defy the armies of the living God?" His voice carried a tone of righteous indignation—how dare this uncircumcised pagan mock God's people!

The soldiers told him about the king's reward. David's oldest brother Eliab heard him talking to the men and became angry. "What are you doing around here anyway?" he demanded. "What about those few sheep you're supposed to be taking care of? I know about your pride and deceit. You just want to see the battle!" Eliab was jealous and dismissive of his little brother.

But David didn't back down. "What have I done now? I was only asking a question!" He walked over to some others and asked them the same thing, and received the same answer. Then someone reported to King Saul what David had said, and the king sent for him.

When David stood before King Saul, he said, "Don't worry about this Philistine. I'll go fight him!" The teenager's confidence was stunning, but Saul was skeptical. "Don't be ridiculous!" he replied. "There's no way you can fight this Philistine and possibly win! You're only a boy, and he's been a man of war since his youth."

But David persisted. "I have been taking care of my father's sheep and goats. When a lion or a bear comes to steal a lamb from the flock, I go after it with a club and rescue the lamb from its mouth. If the animal turns on me, I catch it by the jaw and club it to death. I have done this to both lions and bears, and I'll do it to this pagan Philistine, too, for he has defied the armies of the living God! The Lord who rescued me from the claws of the lion and the bear will rescue me from this Philistine!"

Saul finally consented. "All right, go ahead. And may the Lord be with you!" Then Saul gave David his own armor—a bronze helmet and a coat of mail. David put on the armor and strapped the sword over it. He took a step or two to see how it felt, but he could barely move. "I can't go in these," he protested to Saul. "I'm not used to them." So David took them off.

Instead, he picked up his shepherd's staff and went down to a stream to choose five smooth stones for his sling. He put them in his shepherd's bag and, armed only with his sling, started across the valley to fight the Philistine.

Goliath walked out toward David with his shield bearer ahead of him, sneering in contempt at this ruddy-faced boy with his staff. "Am I a dog," he roared at David, "that you come at me with a stick?" And he cursed David by the names of his gods. "Come over here, and I'll give your flesh to the birds and wild animals!" Goliath bellowed.

But David shouted in reply, "You come to me with sword, spear, and javelin, but I come to you in the name of the Lord of Heaven's Armies—the God of the armies of Israel, whom you have defied! Today the Lord will conquer you, and I will kill you and cut off your head. And then I will give the dead bodies of your men to the birds and wild animals, and the whole world will know that there is a God in Israel! And everyone assembled here will know that the Lord rescues his people, but not with sword and spear. This is the Lord's battle, and he will give you to us!"

As Goliath moved closer to attack, David quickly ran out to meet him. Reaching into his shepherd's bag, David took out a stone, placed it in his sling, and hurled it with all his might. The stone whistled through the air and sank deep into the giant's forehead. Goliath stumbled and fell face down on the ground.

The battlefield went silent. The impossible had happened. So David triumphed over the Philistine with only a sling and a stone, for he had no sword. Then David ran over and pulled Goliath's sword from its sheath. He killed the giant and cut off his head with it.

When the Philistines saw that their champion was dead, they turned and ran. Then the men of Israel and Judah gave a great shout of triumph and rushed after the Philistines, chasing them as far as Gath and the gates of Ekron. The bodies of the dead and wounded Philistines were strewn all along the road. Then the Israelite army returned and plundered the deserted Philistine camp.

David took the Philistine's head to Jerusalem, but he stored the man's armor in his own tent. From that day forward, David's life would never be the same. The shepherd boy had become a warrior, and his faith in God had won a victory that changed the course of Israel's history. What seemed impossible became possible because David trusted not in his own strength, but in the power of the living God.`,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    bookId: '1SA',
    startChapter: 17,
    endChapter: 17,
    reference: '1 Samuel 17',
    category: 'old_testament',
    themes: ['Courage', 'Faith', 'Trust in God', 'Victory'],
    characters: ['David', 'Goliath', 'King Saul', 'Jesse'],
    lesson: 'With God on our side, no obstacle is too big. True strength comes from faith, not physical size.',
    readTime: '12 min',
  },
  {
    id: '4',
    title: 'Daniel in the Lion\'s Den',
    subtitle: 'Faith Under Fire',
    description: 'Daniel was a faithful servant of God who prayed three times daily. When jealous officials convinced the king to ban prayer, Daniel continued to pray. He was thrown into a den of hungry lions, but God sent an angel to shut the lions\' mouths, and Daniel emerged unharmed.',
    image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400',
    bookId: 'DAN',
    startChapter: 6,
    endChapter: 6,
    reference: 'Daniel 6',
    category: 'old_testament',
    themes: ['Faithfulness', 'Prayer', 'Deliverance', 'Courage'],
    characters: ['Daniel', 'King Darius', 'The Satraps'],
    lesson: 'God protects those who remain faithful to Him, even in the face of danger.',
    readTime: '8 min',
    fullStory: ''
  },
  {
    id: '5',
    title: 'Jonah and the Whale',
    subtitle: 'Running from God',
    description: 'God called Jonah to preach to the city of Nineveh, but Jonah fled in the opposite direction by ship. God sent a great storm, and Jonah was thrown overboard and swallowed by a great fish. After three days of prayer, Jonah was released and finally obeyed God\'s call.',
    image: 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=400',
    bookId: 'JON',
    startChapter: 1,
    endChapter: 4,
    reference: 'Jonah 1-4',
    category: 'old_testament',
    themes: ['Obedience', 'Mercy', 'Second Chances', 'God\'s Sovereignty'],
    characters: ['Jonah', 'The Sailors', 'People of Nineveh'],
    lesson: 'We cannot run from God\'s purpose for our lives. His mercy extends to all who repent.',
    readTime: '10 min',
    fullStory: ''
  },
  {
    id: '6',
    title: 'Moses and the Exodus',
    subtitle: 'Freedom from Slavery',
    description: 'The Israelites were slaves in Egypt for 400 years. God called Moses through a burning bush to lead His people to freedom. After ten plagues struck Egypt, Pharaoh finally released the Israelites. God parted the Red Sea for them to cross safely.',
    image: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=400',
    bookId: 'EXO',
    startChapter: 3,
    endChapter: 14,
    reference: 'Exodus 3-14',
    category: 'old_testament',
    themes: ['Deliverance', 'Freedom', 'God\'s Power', 'Leadership'],
    characters: ['Moses', 'Pharaoh', 'Aaron', 'Miriam'],
    lesson: 'God hears the cries of His people and has the power to deliver them from any bondage.',
    readTime: '20 min',
    fullStory: ''
  },
  {
    id: '7',
    title: 'The Birth of Jesus',
    subtitle: 'A Savior is Born',
    description: 'An angel appeared to Mary announcing she would bear God\'s Son. Mary and Joseph traveled to Bethlehem where Jesus was born in a humble manger. Angels announced His birth to shepherds, and wise men followed a star to worship the newborn King.',
    image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400',
    bookId: 'LUK',
    startChapter: 1,
    endChapter: 2,
    reference: 'Luke 1-2, Matthew 1-2',
    category: 'new_testament',
    themes: ['Salvation', 'Humility', 'Prophecy Fulfilled', 'Hope'],
    characters: ['Jesus', 'Mary', 'Joseph', 'Shepherds', 'Wise Men'],
    lesson: 'God\'s greatest gift came in the humblest form. Jesus came to save all people.',
    readTime: '12 min',
    fullStory: ''
  },
  {
    id: '8',
    title: 'The Good Samaritan',
    subtitle: 'Love Your Neighbor',
    description: 'Jesus told a parable about a man who was robbed and left wounded on the road. A priest and a Levite passed by without helping, but a Samaritan—someone from a group the Jews despised—stopped to care for him, paying for his recovery.',
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400',
    bookId: 'LUK',
    startChapter: 10,
    endChapter: 10,
    startVerse: 25,
    endVerse: 37,
    reference: 'Luke 10:25-37',
    category: 'new_testament',
    themes: ['Compassion', 'Love', 'Mercy', 'Neighborliness'],
    characters: ['The Samaritan', 'The Wounded Man', 'Priest', 'Levite'],
    lesson: 'True love for God is shown through compassionate action toward others, regardless of who they are.',
    readTime: '5 min',
    fullStory: ''
  },
  {
    id: '9',
    title: 'The Prodigal Son',
    subtitle: 'A Father\'s Love',
    description: 'Jesus told of a son who demanded his inheritance early, left home, and wasted everything on wild living. When famine struck, he found himself feeding pigs and longing to eat their food. He returned home expecting to be a servant, but his father ran to embrace him and threw a celebration.',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400',
    bookId: 'LUK',
    startChapter: 15,
    endChapter: 15,
    startVerse: 11,
    endVerse: 32,
    reference: 'Luke 15:11-32',
    category: 'new_testament',
    themes: ['Forgiveness', 'Repentance', 'Grace', 'Father\'s Love'],
    characters: ['The Father', 'The Prodigal Son', 'The Older Brother'],
    lesson: 'No matter how far we stray, God welcomes us back with open arms when we return to Him.',
    readTime: '6 min',
    fullStory: ''
  },
  {
    id: '10',
    title: 'Jesus Walks on Water',
    subtitle: 'Faith Over Fear',
    description: 'During a storm on the Sea of Galilee, the disciples saw Jesus walking toward them on the water. Peter asked to come to Him and began walking on water too, but when he noticed the wind, he became afraid and began to sink. Jesus reached out and saved him.',
    image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400',
    bookId: 'MAT',
    startChapter: 14,
    endChapter: 14,
    startVerse: 22,
    endVerse: 33,
    reference: 'Matthew 14:22-33',
    category: 'new_testament',
    themes: ['Faith', 'Trust', 'Fear', 'Jesus\' Power'],
    characters: ['Jesus', 'Peter', 'The Disciples'],
    lesson: 'When we keep our eyes on Jesus, we can do the impossible. Doubt causes us to sink.',
    readTime: '5 min',
    fullStory: ''
  },
];

// Helper function to get stories by category
export const getStoriesByCategory = (category: 'old_testament' | 'new_testament') => {
  return BIBLE_STORIES.filter(story => story.category === category);
};

// Helper function to get story by ID
export const getStoryById = (id: string) => {
  return BIBLE_STORIES.find(story => story.id === id);
};

// Helper function to search stories
export const searchStories = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return BIBLE_STORIES.filter(story =>
    story.title.toLowerCase().includes(lowerQuery) ||
    story.subtitle.toLowerCase().includes(lowerQuery) ||
    story.themes.some(theme => theme.toLowerCase().includes(lowerQuery)) ||
    story.characters.some(char => char.toLowerCase().includes(lowerQuery))
  );
};

// Get featured stories (first 4)
export const getFeaturedStories = () => {
  return BIBLE_STORIES.slice(0, 4);
};

// Story categories for filtering
export const STORY_CATEGORIES = [
  { id: 'all', label: 'All Stories' },
  { id: 'old_testament', label: 'Old Testament' },
  { id: 'new_testament', label: 'New Testament' },
];

// Theme colors for stories
export const STORY_THEME_COLORS: Record<string, string> = {
  'Creation': '#10B981',
  'Faith': '#3B82F6',
  'Courage': '#EF4444',
  'Obedience': '#8B5CF6',
  'Love': '#EC4899',
  'Mercy': '#F59E0B',
  'Salvation': '#6366F1',
  'Forgiveness': '#14B8A6',
  'Prayer': '#8B5CF6',
  'Trust': '#3B82F6',
};

export default BIBLE_STORIES;