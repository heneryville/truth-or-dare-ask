// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest')
            || (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
                && Alexa.getIntentName(handlerInput.requestEnvelope) === 'LaunchIntent');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak("Welcome to Truth or Dare.")
            .addDirective({ "type": "Alexa.Advertisement.InjectAds"})
            .withShouldEndSession(false)
            .getResponse();
    }
};

const AdCompletedHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request
            .type.startsWith('Alexa.Advertisement.AdCompletedHandler');
    },
    async handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('Do you want a truth, or a dare?')
            .repompt('Will that be a truth, or a dare?')
            .getResponse();
    }
};

const AdNotRenderedHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request
            .type.startsWith('Alexa.Advertisement.AdNotRendered');
    },
    async handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('Do you want a truth, or a dare?')
            .repompt('Will that be a truth, or a dare?')
            .getResponse();
    }
};

const TruthIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TruthIntent';
    },
    async handle(handlerInput) {
        //const truth = handler.model.pickTruth();
        const truth = 'What color is the moon?'
        const speakOutput = `A truth. ${truth}`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse()
    }
};

const DareIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DareIntent';
    },
    async handle(handlerInput) {
        const dare = 'Crawl under the table and act like there is an earthquake.'
        const speakOutput = `Your dare is to ${dare}`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse()
    }
}

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Ask for a truth or a dare. Simply say, Alexa ask Truth or Dare for a truth. To play, gather a group of at least three friends and take turns answering either a truth or a dare.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ignored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        AdCompletedHandler,
        AdNotRenderedHandler,
        TruthIntentHandler,
        DareIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
    )
    .addResponseInterceptors(function(requestEnvelope, response){
		console.log("\n" + "******************* REQUEST ENVELOPE **********************");
		console.log("\n" + JSON.stringify(requestEnvelope, null, 4));
		console.log("\n" + "******************* RESPONSE  **********************");
		console.log("\n" + JSON.stringify(response, null, 4));
	})
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
