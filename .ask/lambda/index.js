// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const TruthOrDare = require('./services/TruthOrDare');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest')
            || (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
                && Alexa.getIntentName(handlerInput.requestEnvelope) === 'LaunchIntent');
    },
    async handle(hand) {
        if (await hand.model.shouldOfferSub()) {
            return hand.responseBuilder
                .addDirective(await hand.model.isp.upsellByReferenceName('full_library',
                    'Welcome to Truth or Dare. Would you like to get access to 200 more truths or dares?',
                    'sub-upsell'
                ))
                .getResponse();

        }
        return hand.responseBuilder
            .speak("Welcome to Truth or Dare. Do you want a truth, or a dare?")
            .reprompt("What are you in the mood for? A truth or a dare?")
            .withShouldEndSession(false)
            .getResponse();

    }
};

const ConnectionsResponseHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request
            .type.startsWith('Connections.Response');
    },
    handle(hand) {
        const req = hand.requestEnvelope.request;
        if (req.name == 'Cancel') {
            return hand.responseBuilder
                .speak('Do you want a truth, or a dare?')
                .reprompt('Will that be a truth, or a dare?')
                .getResponse();
        }
        const didAccept = req.payload.purchaseResult == 'ACCEPTED';
        if (didAccept) {
            return hand.responseBuilder
                .speak('Lets move on. Do you want a truth, or a dare?')
                .reprompt('Will that be a truth, or a dare?')
                .getResponse();

        } else {
            return hand.responseBuilder
                .speak('Lets move on then. Do you want a truth, or a dare?')
                .reprompt('Will that be a truth, or a dare?')
                .getResponse();
        }
    }
};

const SubscribeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SubscribeIntent';
    },
    async handle(hand) {
        console.log()
        return hand.responseBuilder
            .addDirective(await hand.model.isp.buyByReferenceName('full_library', 'Do you want to upgrade to the full library?'))
            .getResponse()
    }
};

const RefundIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RefundIntent';
    },
    async handle(hand) {
        const dir = await hand.model.isp.cancelByReferenceName('full_library', 'sub-cancel');
        console.log("refund directive", dir)
        return hand.responseBuilder
            .addDirective(dir)
            .getResponse()
    }
};

const TruthIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TruthIntent';
    },
    async handle(handlerInput) {
        await handlerInput.model.pickTruth();
        const speakOutput = `A truth. ${handlerInput.model.truth}`;
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
        await handlerInput.model.pickDare();
        const speakOutput = `Your dare is to ${handlerInput.model.dare}`;
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
        const speakOutput = 'Ask for a truth or a dare. Simply say, Alexa ask Truth or Dare for a truth. To play, gather a group of at least three friends and take turns answering either a truth or a dare. Do you want a truth, or a dare?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Will that be a truth or a dare?')
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
        const speakOutput = `Sorry, I had trouble doing what you asked. Please say it again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

;

const InjectModelInterceptor = {
    async process(handlerInput) {
        const model = await TruthOrDare.deserialize(
            handlerInput.attributesManager.getSessionAttributes(),
            //handlerInput?.requestEnvelope?.session?.attributes,
            handlerInput?.requestEnvelope
        );
        handlerInput.model = model;
    }
};

const PersistModelInterceptor = {
    async process(handlerInput, response) {
        if (handlerInput.model) {
            handlerInput.attributesManager.setSessionAttributes(await handlerInput.model.serialize())
            delete handlerInput.model 
        }
    }
}


// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestInterceptors(InjectModelInterceptor)
    .addRequestHandlers(
        LaunchRequestHandler,
        TruthIntentHandler,
        DareIntentHandler,
        CancelAndStopIntentHandler,
        HelpIntentHandler,
        ConnectionsResponseHandler,
        SubscribeIntentHandler,
        RefundIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
    )
    .addResponseInterceptors(PersistModelInterceptor)
    .addResponseInterceptors(function (requestEnvelope, response) {
        console.log("\n" + "******************* REQUEST ENVELOPE **********************");
        console.log("\n" + JSON.stringify(requestEnvelope, null, 4));
        console.log("\n" + "******************* RESPONSE  **********************");
        console.log("\n" + JSON.stringify(response, null, 4));
    })
    .addResponseInterceptors(function (requestEnvelope, response) {
    })
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
