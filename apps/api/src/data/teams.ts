import type { TeamSummary } from "../types.js";

// Times da liga mock. Nomes, cidades, estádios e fundação são reais;
// técnicos, elencos e resultados são fictícios.

export interface TeamRecord {
  id: string;
  name: string;
  shortName: string;
  city: string;
  stadium: string;
  founded: number;
  coach: string;
  strength: number; // força relativa usada na simulação (≈ 0.7 a 1.35)
}

export const teams: TeamRecord[] = [
  { id: "botafogo", name: "Botafogo", shortName: "BOT", city: "Rio de Janeiro", stadium: "Nilton Santos", founded: 1904, coach: "Renato Albuquerque", strength: 1.32 },
  { id: "palmeiras", name: "Palmeiras", shortName: "PAL", city: "São Paulo", stadium: "Allianz Parque", founded: 1914, coach: "Marcelo Antunes", strength: 1.3 },
  { id: "flamengo", name: "Flamengo", shortName: "FLA", city: "Rio de Janeiro", stadium: "Maracanã", founded: 1895, coach: "Ricardo Menezes", strength: 1.28 },
  { id: "gremio", name: "Grêmio", shortName: "GRE", city: "Porto Alegre", stadium: "Arena do Grêmio", founded: 1903, coach: "Paulo Siqueira", strength: 1.18 },
  { id: "internacional", name: "Internacional", shortName: "INT", city: "Porto Alegre", stadium: "Beira-Rio", founded: 1909, coach: "Eduardo Lacerda", strength: 1.14 },
  { id: "sao-paulo", name: "São Paulo", shortName: "SAO", city: "São Paulo", stadium: "Morumbis", founded: 1930, coach: "Fernando Castilho", strength: 1.12 },
  { id: "atletico-mg", name: "Atlético Mineiro", shortName: "CAM", city: "Belo Horizonte", stadium: "Arena MRV", founded: 1908, coach: "Gustavo Prado", strength: 1.1 },
  { id: "cruzeiro", name: "Cruzeiro", shortName: "CRU", city: "Belo Horizonte", stadium: "Mineirão", founded: 1921, coach: "André Valadares", strength: 1.06 },
  { id: "fortaleza", name: "Fortaleza", shortName: "FOR", city: "Fortaleza", stadium: "Arena Castelão", founded: 1918, coach: "Juan Echeverría", strength: 1.04 },
  { id: "bahia", name: "Bahia", shortName: "BAH", city: "Salvador", stadium: "Arena Fonte Nova", founded: 1931, coach: "Rogério Matos", strength: 1.02 },
  { id: "fluminense", name: "Fluminense", shortName: "FLU", city: "Rio de Janeiro", stadium: "Maracanã", founded: 1902, coach: "Luís Brandão", strength: 1.0 },
  { id: "corinthians", name: "Corinthians", shortName: "COR", city: "São Paulo", stadium: "Neo Química Arena", founded: 1910, coach: "Sérgio Bastos", strength: 0.98 },
  { id: "bragantino", name: "Red Bull Bragantino", shortName: "RBB", city: "Bragança Paulista", stadium: "Nabi Abi Chedid", founded: 1928, coach: "Tiago Werneck", strength: 0.95 },
  { id: "vasco", name: "Vasco da Gama", shortName: "VAS", city: "Rio de Janeiro", stadium: "São Januário", founded: 1898, coach: "Henrique Dutra", strength: 0.93 },
  { id: "athletico-pr", name: "Athletico Paranaense", shortName: "CAP", city: "Curitiba", stadium: "Ligga Arena", founded: 1924, coach: "Márcio Teixeira", strength: 0.9 },
  { id: "santos", name: "Santos", shortName: "SAN", city: "Santos", stadium: "Vila Belmiro", founded: 1912, coach: "Cláudio Reis", strength: 0.88 },
  { id: "vitoria", name: "Vitória", shortName: "VIT", city: "Salvador", stadium: "Barradão", founded: 1899, coach: "Alexandre Pimenta", strength: 0.84 },
  { id: "juventude", name: "Juventude", shortName: "JUV", city: "Caxias do Sul", stadium: "Alfredo Jaconi", founded: 1913, coach: "Daniel Fontoura", strength: 0.8 },
  { id: "sport", name: "Sport", shortName: "SPT", city: "Recife", stadium: "Ilha do Retiro", founded: 1905, coach: "Roberto Galvão", strength: 0.76 },
  { id: "ceara", name: "Ceará", shortName: "CEA", city: "Fortaleza", stadium: "Arena Castelão", founded: 1914, coach: "Vinícius Aragão", strength: 0.74 },
];

export const teamsById = new Map(teams.map((team) => [team.id, team]));

export function toSummary(team: TeamRecord): TeamSummary {
  return { id: team.id, name: team.name, shortName: team.shortName, crest: null };
}
