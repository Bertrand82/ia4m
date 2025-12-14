import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { environment_secret } from '../environments/environment_secret';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { from, mergeAll, Observable } from 'rxjs';
import { KeysService } from './bg-environment-keys-service';
import { PostWithAuthService } from './httpbackend-client-service';

@Injectable({
  providedIn: 'root',
})
export class BgGemini {
  // private apiUrl = `${environment.geminiApiUrl}`;

  constructor(private http: HttpClient, public keyService: KeysService, private postWithAuthService: PostWithAuthService) { }

  generateContent(
    prompt: string,
    responseShemaRequested: any
  ): Observable<any> {

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: responseShemaRequested,
      },
    };

    console.log('Gemini models  body : ', body);
    const promiseObservable = this.postWithAuthService.postBackToGeminiWithAuthAsync(body);
    return from(promiseObservable).pipe(mergeAll());
    //return this.http.post<any>(this.apiUrl, body, { headers });
  }
}
export function responseShemaGemini_v11(langue: string): any {
  const schema = {
    type: 'object',
    properties: {
      niveauDeCorrespondanceDe1A10: { type: 'number' },
      lettreMotivation: {
        type: 'string',
        description: 'Lettre de motivation dans la langue ' + langue,
      },
      motsClésCommunsOffreEtCV: { type: 'string' },
      nombreDeMots: {
        type: 'number',
        description: 'renseigne le nombre de mots dans la lettre de motivation',
      },
      'cv.nom': {
        type: 'string',
        description: 'renseigne le nom de la personne identifiée dans le CV',
      },
      'cv.prenom': {
        type: 'string',
        description: 'renseigne le prénom de la personne identifiée dans le CV',
      },
      'cv.nationalite': {
        type: 'string',
        description:
          'renseigne la nationalité de la personne identifiée dans le CV',
      },
      'cv.age': {
        type: 'number',
        description: "renseigne l'âge de la personne identifiée dans le CV",
      },
      'cv.experience': {
        type: 'string',
        description:
          "renseigne l'expérience de la personne identifiée dans le CV",
      },
      langue: { type: 'string', enum: ['fr', 'en'] },
    },
    required: [
      'niveauDeCorrespondanceDe1A10',
      'lettreMotivation',
      'motsClésCommunsOffreEtCV',
    ],
    propertyOrdering: [
      'niveauDeCorrespondanceDe1A10',
      'lettreMotivation',
      'motsClésCommunsOffreEtCV',
    ],
  };
  return schema;
}

export const reponseAnalyseOffreEmploi = {
  type: 'object',
  properties: {
    'offre.titre': {
      type: 'string',
      description:
        "récupérer le titre de l’offre d'emploi ou si il n'y en a pas, générer un titre résumant les compétences demandées",
    },
    'offre.date': {
      type: 'string',
      description:
        "renseigne la date de l’offre. Si il n'y a pas de date, indiquez ''",
    },
    'offre.resume': { type: 'string', maxLength: 80 },
    'offre.societe': {
      type: 'string',
      description: 'renseigne le nom de la société identifiée dans l’offre',
    },
    'offre.personne': {
      type: 'string',
      description: 'renseigne le nom de la personne identifiée dans l’offre',
    },
    'offre.email': {
      type: 'string',
      description: "renseigne l'email de la personne identifiée dans l’offre",
    },
    'offre.lieu': {
      type: 'string',
      description: 'renseigne le lieu du poste identifié dans l’offre',
    },
    'offre.pays': {
      type: 'string',
      description: 'renseigne le pays du poste identifié dans l’offre',
    },
    'offre.freelance': {
      type: 'boolean',
      description:
        "Dans l'offre d'emploi,précise si le poste est en freelance ou non",
    },
    'offre.langue': { type: 'string', enum: ['fr', 'en', 'es'] },
    'offre.isOffreEmploi': {
      type: 'boolean',
      description: "Indique si le document est bien une offre d'emploi",
    },
  },
  required: [
    'offre.titre',
    'offre.date',
    'offre.langue',
    'offre.resume',
    'offre.societe',
    'offre.personne',
    'offre.lieu',
    'offre.freelance',
  ],
};

export const reponseAnalyseCV = {
  type: 'object',
  properties: {
    'cv.titre': {
      type: 'string',
      description:
        "récupérer le titre du cv ou si il n'y en a pas, générer un titre résumant le cv",
    },
    'cv.resume': { type: 'string', maxLength: 80, description: 'resumé du cv' },
    'cv.societes': {
      type: 'array',
      items: { type: 'string' },
      description: 'liste des noms des societes apparaissant dans le cv',
    },
    'cv.skills': {
      type: 'array',
      items: { type: 'string' },
      description: 'liste des compétences du cv',
    },
    'cv.personne': {
      type: 'string',
      description: 'renseigne le nom de la personne identifiée dans l’offre',
    },
    'cv.email': {
      type: 'string',
      description: "renseigne l'email de la personne identifiée dans l’offre",
    },
    'cv.nationalité': {
      type: 'string',
      description: 'renseigne la nationalité du candidat',
    },
    'cv.adresse': {
      type: 'string',
      description: 'renseigne le pays du poste identifié dans l’offre',
    },
    'cv.freelance': {
      type: 'boolean',
      description:
        "Dans l'offre d'emploi,précise si le poste est en freelance ou non",
    },
    'cv.langues': {
      type: 'array',
      items: { type: 'string', enum: ['fr', 'en', 'es'] },
      description: 'renseigne les langues du cv',
    },
    'cv.langue': {
      type: 'string',
      enum: ['fr', 'en', 'es'],
      description: 'renseigne la langue du cv',
    },
    'cv.isCV': {
      type: 'boolean',
      description: 'Indique si le document est bien un CV',
    },
  },
  required: [
    'cv.titre',
    'cv.resume',
    'cv.langue',
    'cv.societes',
    'cv.personne',
    'cv.email',
    'cv.nationalité',
    'cv.adresse',
    'cv.freelance',
  ],
};

export const reponseGeminiListeItemsCV = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      description: 'Liste des expériences ou éléments structurés extraits',
      items: {
        type: 'object',
        properties: {
          titre: {
            type: 'string',
            description: "Le titre du poste ou de l'expérience",
          },
          date_debut: {
            type: 'string',
            description: 'Date de début au format ISO ou YYYY-MM',
            pattern: '^\\d{4}(-\\d{2})?$',
          },
          date_fin: {
            type: 'string',
            description:
              "Date de fin au format ISO ou YYYY-MM, ou 'en cours' si toujours en poste",
            pattern: '^\\d{4}(-\\d{2})?$|^en cours$',
          },
          resume: {
            type: 'string',
            description: "Résumé de l'expérience ou du poste",
          },
          skills: {
            type: 'array',
            items: { type: 'string' },
            description: 'Liste des compétences mobilisées',
          },
          company: {
            type: 'string',
            description: "Nom de la société ou de l'organisation",
          },
        },
        required: [
          'titre',
          'date_debut',
          'date_fin',
          'resume',
          'skills',
          'company',
        ],
      },
    },
  },
  required: ['items'],
};
