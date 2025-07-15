export const API_URL = 'https://pokeapi.co/api/v2/';
export let allPokemonData = []; 
export const pokemonDetailsCache = new Map(); 

export const setAllPokemonData = (data) => {
    allPokemonData = data;
};