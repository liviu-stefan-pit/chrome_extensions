// Fetch detailed media info from AniList
const API = 'https://graphql.anilist.co';

export async function anilistMediaDetails(id){
  const query = `query ($id:Int){ Media(id:$id, type:ANIME){ id title{romaji english native} description(asHtml:false) coverImage{large extraLarge} bannerImage meanScore episodes duration season seasonYear format status siteUrl genres
    nextAiringEpisode{episode airingAt}
    studios{nodes{name isAnimationStudio}}
    tags{name rank isMediaSpoiler}
  } }`;
  const res = await fetch(API, { method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'}, body:JSON.stringify({query, variables:{id}})});
  if(!res.ok) throw new Error('AniList detail HTTP '+res.status);
  const json = await res.json();
  if(json.errors) throw new Error('AniList detail errors '+JSON.stringify(json.errors));
  return json.data?.Media;
}

// Map MAL ID to AniList ID
export async function malToAniListId(malId){
  const query = `query ($malId:Int){ Media(idMal:$malId, type:ANIME){ id } }`;
  const res = await fetch(API, { method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'}, body:JSON.stringify({query, variables:{malId}})});
  if(!res.ok) throw new Error('MAL->AniList mapping HTTP '+res.status);
  const json = await res.json();
  if(json.errors) throw new Error('MAL->AniList mapping errors '+JSON.stringify(json.errors));
  return json.data?.Media?.id;
}
