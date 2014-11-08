var tracks = [
    "001-Albeniz I - Tango", 
    "002-Bach, JS - Aria (Goldberg Variations)", 
    "003-Bach, JS - Fugue (WTC Bk-1 No-21)", 
    "004-Bach, JS - Fugue (WTC Bk-1 No-3)", 
    "005-Bach, JS - Fugue (WTC Bk-1 No-5)", 
    "006-Bach, JS - Fugue (WTC Bk-1 No-7)", 
    "007-Bach, JS - Gavotte (French Suite No-5)", 
    "008-Bach, JS - Italian Concerto Mvt-1", 
    "009-Bach, JS - Italian Concerto Mvt-2", 
    "010-Bach, JS - Italian Concerto Mvt-3", 
    "011-Bach, JS - Jesu Joy of Mans Desiring", 
    "012-Bach, JS - March in D", 
    "013-Bach, JS - Minuet in G (2)", 
    "014-Bach, JS - Minuet in G", 
    "015-Bach, JS - Musette in D", 
    "016-Bach, JS - Prelude (WTC Bk-1 No-21)", 
    "017-Bach, JS - Prelude (WTC Bk-1 No-3)", 
    "018-Bach, JS - Prelude (WTC Bk-1 No-5", 
    "019-Bach, JS - Prelude (WTC Bk-1 No-7)", 
    "020-Bach, JS - Prelude in C (WTC) Bk.1)", 
    "021-Bach, JS - Toccata and Fugue in D", 
    "022-Balakirev - Islamey", 
    "023-Beethoven - Bagatelle Op-33 No-1", 
    "024-Beethoven - Bagatelle Op-33 No-4", 
    "025-Beethoven - Fuer Elise", 
    "026-Beethoven - Moonlight Sonata Op-27 No-2 Mvt-1", 
    "027-Beethoven - Moonlight Sonata Op-27 No-2 Mvt-2", 
    "028-Beethoven - Moonlight Sonata Op-27 No-2 Mvt-3", 
    "029-Beethoven - Pathetique Sonata Op-13 Mvt-1", 
    "030-Beethoven - Pathetique Sonata Op-13 Mvt-2", 
    "031-Beethoven - Pathetique Sonata Op-13 Mvt-3", 
    "032-Beethoven - Symphony No-5 Mvt-1", 
    "033-Boccherini - Minuet", 
    "034-Brahms - Ballade in D Op-10 No-1", 
    "035-Brahms - Ballade in G Op-118 No-3", 
    "036-Brahms - Capriccio in BOp-76 No-2", 
    "037-Brahms - Intermezzo in A Op-118 No-2", 
    "038-Brahms - Intermezzo in B-flat Op-117 No-2", 
    "039-Brahms - Intermezzo in C-sharp Op-117 No-3", 
    "040-Brahms - Intermezzo in E-flat Op-117 No-1", 
    "041-Brahms - Intermezzo in E-flat Op-118 No-6", 
    "042-Brahms - Rhapsody in G Op-79 No-2", 
    "043-Brahms - Waltz in A-flat Op-39 No-15", 
    "044-Chaminade - Automne (Etude de Concert) Op-35 No-2", 
    "045-Chopin - Ballade No-1 in G Op-23", 
    "046-Chopin - Barcarolle Op-60", 
    "047-Chopin - Etude in A op.25 No-11", 
    "048-Chopin - Etude in A-flat Op-25 No-1", 
    "049-Chopin - Etude in C Op-10 No-12 (Revolutionary)", 
    "050-Chopin - Etude in C-sharp Op-25 No-7 (Cello)", 
    "051-Chopin - Etude in E Op-10 No-3", 
    "052-Chopin - Etude in G-flat Op-10 No-5 (Black Key)", 
    "053-Chopin - Etude in G-sharp Op-25 No-6", 
    "054-Chopin - Fantaisie-Impromptu in C-sharp Op-66", 
    "055-Chopin - Mazurka in B Op-33 No-4", 
    "056-Chopin - Mazurka in B-flat Op-7 No-1", 
    "057-Chopin - Mazurka in C-sharp Op-63 No-3", 
    "058-Chopin - Mazurka in F-sharp Op-6 No-1", 
    "059-Chopin - Nocturne in B Op-32 No-1", 
    "060-Chopin - Nocturne in D-flat Op-27 No-2", 
    "061-Chopin - Nocturne in E Op-62 No-2", 
    "062-Chopin - Nocturne in E-flat Op-9 No-2", 
    "063-Chopin - Nocturne in F-sharp Op-15 No-2", 
    "064-Chopin - Nocturne in G Op-37 No-1", 
    "065-Chopin - Polonaise in A Op-40 No-1 (Military)", 
    "066-Chopin - Polonaise in A-flat Op-53", 
    "067-Chopin - Prelude in A Op-28 No-7", 
    "068-Chopin - Prelude in B Op-28 No-5", 
    "069-Chopin - Prelude in D-flat Op-28 No-15 (Raindrop)", 
    "070-Chopin - Prelude in E Op-28 No-4", 
    "071-Chopin - Prelude in F-sharp Op-28 No-8", 
    "072-Chopin - Scherzo in C-sharp", 
    "073-Chopin - Waltz in C-sharp Op-64 No-2", 
    "074-Chopin - Waltz in D-flat Op-64 No-1 (Minute)", 
    "075-Chopin - Waltz in E Op-Posth.", 
    "076-Chopin - Waltz in E-flat Op-18", 
    "077-Debussy - Arabesque No-1 in E", 
    "078-Debussy - Arabesque No-2 in G", 
    "079-Debussy - Clair de lune", 
    "080-Debussy - Danse", 
    "081-Debussy - Doctor Gradys ad Parnassum (Childrens Corner", 
    "082-Debussy - Golliwogs Cake Walk (Childrens Corner)", 
    "083-Debussy - Jimbos Lullaby (Childrens Corner)", 
    "084-Debussy - Reflections in the Water", 
    "085-Debussy - Reverie", 
    "086-Debussy - Serenade for the Doll (Childrens Corner)", 
    "087-Debussy - The Engulfed Cathedral", 
    "088-Debussy - The Girl With The Flaxen Hair", 
    "089-Debussy - The Little Shepherd (Childrens Corner)", 
    "090-Debussy - The Snow is Dancing (Childrens Corner)", 
    "091-Debussy - Valse - La plus que lente", 
    "092-Elgar - Pomp and Circumstance No-1", 
    "093-Faure - Claire de lune Op-46 No-2", 
    "094-Faure - Impromptu in F minor Op-31 No-2", 
    "095-Grainger - Country Gardens", 
    "096-Grainger - Irish tune from County Derry", 
    "097-Grainger - Shepherds Hey", 
    "098-Granados - Oriental", 
    "099-Grieg - Air (Holberg)", 
    "100-Grieg - Anitras Dance (Peer Gynt)", 
    "101-Grieg - Arietta Op-12 No-1", 
    "102-Grieg - Ases Death (Peer Gynt)", 
    "103-Grieg - Elfin Dance Op-12", 
    "104-Grieg - Gavotte (Holberg)", 
    "105-Grieg - I Love Thee", 
    "106-Grieg - In the Hall of the Mountain King (Peer Gynt)", 
    "107-Grieg - March of the Dwarfs Op-54 No-3", 
    "108-Grieg - Morning Mood (Peer Gynt)", 
    "109-Grieg - Nocturne Op-54 No-4", 
    "110-Grieg - Preludium (Holberg)", 
    "111-Grieg - Rigaudon (Holberg)", 
    "112-Grieg - Sarabande (Holberg)", 
    "113-Grieg - Solvejgs Song Op-52 No-4", 
    "114-Grieg - The Bird Op-43 No-4", 
    "115-Grieg - The Butterfly Op-43 No-1", 
    "116-Grieg - To the Spring Op-43 No-6", 
    "117-Grieg - Wedding Day at Troldhaugen Op-65 No-6", 
    "118-Haydn - Sonata in E-flat Mvt-1 (Hob.XVI-52)", 
    "119-Haydn - Sonata in E-flat Mvt-2 (Hob.XVI-52)", 
    "120-Haydn - Sonata in E-flat Mvt-3 (Hob.XVI-52)", 
    "121-Joplin S - The Entertainer", 
    "122-Ketelbey - in A Monastery Garden", 
    "123-Liszt - Ave Maria", 
    "124-Liszt - Concert Etude No-3 in D-flat (Un Sospiro)", 
    "125-Liszt - Hungarian Rhapsody No-2", 
    "126-Liszt - Liebestraume No-1", 
    "127-Liszt - Liebestraume No-3", 
    "128-Liszt - Mephisto Waltz", 
    "129-Liszt - On the Edge Of a Spring", 
    "130-Liszt - Paganini Etude No-3 (La Campanella)", 
    "131-Liszt - Valse Oubliee", 
    "132-Liszt - Valse-Impromptu", 
    "133-MacDowell E - To a Wild Rose Op-51", 
    "134-Mendelssohn - Andante and Rondo Capriciosso Op-14", 
    "135-Mendelssohn - Song of Spring Op-62 No-6", 
    "136-Mendelssohn - Song without Words Op-19 No-1", 
    "137-Mendelssohn - Song without Words Op-38 No-2", 
    "138-Mendelssohn - Song without Words Op-85 No-1", 
    "139-Mendelssohn - Spinners Song Op-67 No-4", 
    "140-Mendelssohn - Wedding March", 
    "141-Mozart - Fantasy in C K-475", 
    "142-Mozart - Fantasy in D K-397", 
    "143-Mozart - Sonata in A 1st Mvt. K-331", 
    "144-Mozart - Sonata in A 2nd Mvt. K-331", 
    "145-Mozart - Sonata in A 3rd Mvt-(Alla Turca) K-331", 
    "146-Mozart - Sonata in C Allegro K.545", 
    "147-Mozart - Sonata in C Andante K.545", 
    "148-Mozart - Sonata in C Rondo K.545", 
    "149-Mozart - Variations on Ah vous dirais-je maman", 
    "150-Mussorgsky - Ballet of the Unhatched Chickens (Pictures)", 
    "151-Mussorgsky - Bydlo (Pictures)", 
    "152-Mussorgsky - Promenade (Pictures)", 
    "153-Mussorgsky - The Old Castle (Pictures)", 
    "154-Mussorgsky - Tuileries (Pictures)", 
    "155-Poulenc - Mouvement perpetuels", 
    "156-Prokofiev - Prelude Op-12 No-7", 
    "157-Rachmaninov - Flight of the Bumblebee", 
    "158-Rachmaninov - Prelude in C-sharp Op-3 No-2", 
    "159-Rachmaninov - Prelude in G Op-23 No-5", 
    "160-Ravel - Jeux deau (Fountains)", 
    "161-Ravel - Menuet on the Name of Haydn (Sonatina)", 
    "162-Ravel - Pavane For A Dead Princess", 
    "163-Satie Eric - Gymnopedie No-1", 
    "164-Satie Eric - Gymnopedie No-2", 
    "165-Satie Eric - Gymnopedie No-3", 
    "166-Scarlatti - Sonata in C L.104 K.159", 
    "167-Scarlatti - Sonata in D", 
    "168-Scarlatti - Sonata in F", 
    "169-Schubert - Impromptu in A-flat minor Op-90 No-4", 
    "170-Schubert - Impromptu in E-flat Op-90 No-2", 
    "171-Schubert - Impromptu in G-flat Op-90 No-3", 
    "172-Schumann - About Foreign Lands and People Op-15 No-1", 
    "173-Schumann - Almost Too Serious Op-15 No-10", 
    "174-Schumann - Arabeske Op-18", 
    "175-Schumann - By the Fireside Op-15 No-8", 
    "176-Schumann - Catch Me! Op-15 No-3", 
    "177-Schumann - Child Falling Asleep Op-15 No-12", 
    "178-Schumann - Curious Story Op-15 No-2", 
    "179-Schumann - Frightening Op-15 No-11", 
    "180-Schumann - Important Event Op-15 No-6", 
    "181-Schumann - In the Evening Op-12 No-1", 
    "182-Schumann - In the Night Op-12 No-5", 
    "183-Schumann - King of the Rocking-Horse Op-15 No-9", 
    "184-Schumann - Perfect Happiness Op-15 No-5", 
    "185-Schumann - Pleading Child Op-15 No-4", 
    "186-Schumann - Restless Dreams Op-12 No-7", 
    "187-Schumann - Reverie Op-15 No-7", 
    "188-Schumann - Romanze in F-sharp Op-28 No-2", 
    "189-Schumann - Soaring Op-12 No-2", 
    "190-Schumann - The Happy Farmer", 
    "191-Schumann - The Poet Speaks Op-15 No-13", 
    "192-Schumann - The Songs End Op-12 No-8", 
    "193-Schumann - Whims Op-12 No-4", 
    "194-Schumann - Why Op-12 No-3", 
    "195-Scriabin - Etude in C-sharpop.2no 11", 
    "196-Sibelius - Romance in D-flat", 
    "197-Sibelius - Valse Triste", 
    "198-Sinding - Rustles of Spring Op-32 No-3", 
    "199-Tchaikovsky - Arabian Dance (Nutcracker)", 
    "200-Tchaikovsky - Chinese Dance (Nutcracker)", 
    "201-Tchaikovsky - Dance of the Reed Flutes (Nutcracker)", 
    "202-Tchaikovsky - Dance of the Sugar-Plum Fairy (Nutcracker)", 
    "203-Tchaikovsky - June (Barcarolle) Op-37 No-6", 
    "204-Tchaikovsky - March (Nutcracker)", 
    "205-Tchaikovsky - Mazurka Op-39 No-10", 
    "206-Tchaikovsky - Neapolitan Song Op-39 No-18", 
    "207-Tchaikovsky - Old French Song Op-39 No-16", 
    "208-Tchaikovsky - Overture (Nutcracker)", 
    "209-Tchaikovsky - Russian Dance (Nutcracker)", 
    "210-Tchaikovsky - Song of the Lark Op-39 No-22", 
    "211-Tchaikovsky - Sweet Dream Op-39 No-21", 
    "212-Tchaikovsky - Waltz of the Flowers (Nutcracker)", 
    "213-Tchaikovsky - Waltz Op-39 No-8", 
    "214-Villa-Lobos - Punch (Le Polichinelle)", 
    "215-Von Weber - Rondo Brilliant in E-flat Op-62"
];

$(function() {
  var currComposer;
  var pieces = [];

  for (var i = 0; i < tracks.length; i++) {
    var track = tracks[i];

    var number = track.substring(0, 3);

    track.match(/([0-9][0-9][0-9])\-([\w, ]+) \- (.*)/i)

    var composer = RegExp.$2;
    var piece = RegExp.$3;

    if (pieces.length == 0 || currComposer === composer) {
      currComposer = composer;
      pieces.push(number + '' + piece);
    } else { // new composer
      console.log(currComposer);  
      addToDropdown(currComposer, getSubmenu(currComposer, pieces));

      currComposer = composer;
      pieces = [];
      pieces.push(number + '' + piece);
    }
  }

  addToDropdown(currComposer, getSubmenu(currComposer, pieces)); // Off by Von Weber (read it with German accent)

  // this code allows users to change pieces by changing URLs
  window.onhashchange = function() {
    if (window.location.hash.length <= 1) {
      return;
    }

    var target = decodeURIComponent(window.location.hash.substring(1));

    console.log(target);

    for (var i = 0; i < tracks.length; i++) {
      if (tracks[i].indexOf(target) != -1) {
        console.log('swith');
        switchTo('tracks/' + tracks[i])
      }
    }
  }

  window.onhashchange();
});

function addToDropdown(composer, submenu) {
  if (composer < "H") {
    $('#track-choices-1').append(submenu);
  } else if (composer < "S") {
    $('#track-choices-2').append(submenu);
  } else {
    $('#track-choices-3').append(submenu);
  }
}

function getSubmenu(composer, pieces) {
  var pieceMenu = '';

  for (var i = 0; i < pieces.length; i++) {
    var number = pieces[i].substring(0, 3);
    var piece = pieces[i].substring(3);

    pieceMenu += getChoice(composer, piece, number) + '\n';
  }

  var submenu = '<li class="dropdown-submenu">' +
    '<a tabindex="-2" href="#">' + composer + '</a>' +
    '<ul class="dropdown-menu">' +
      pieceMenu +
    '</ul>' +
  '</li>';

  return submenu;
}

function getChoice(composer, piece, number) {
  var target = number + '-' + composer +' - ' + piece;
  return '<li><a href="#' + encodeURIComponent(piece) + '">' + piece + '</a></li>'
}
