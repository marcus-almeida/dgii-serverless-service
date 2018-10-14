'use strict';
const soapRequest = require('easy-soap-request');
const parseString = require('xml2js').parseString

/**
 * Base response HTTP headers
*/
const responseHeaders = {
  'Content-Type':'application/json',
  'Access-Control-Allow-Origin' : '*',        // Required for CORS support to work
  'Access-Control-Allow-Credentials' : true   // Required for cookies, authorization headers with HTTPS
};

/**
 * HTTP response templates
*/
const responses = {
  success: (data={}, code=200) => {
    return {
      'statusCode': code,
      'headers': responseHeaders,
      'body': JSON.stringify(data)
    }
  },
  error: (error) => {
    return {
      'statusCode': error.code || 500,
      'headers': responseHeaders,
      'body': JSON.stringify(error)
    }
  }
};

// Soap XML header and closing is the same for all requests at WSMovilDGII
// so we made a function to not have to repeat ourselves every time.
const composeSoapXml = (soapBody) => {
	const soapHeader =
		'<?xml version="1.0" encoding="utf-8"?>' +
		'<soap12:Envelope ' +
			'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
			'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
			'xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">' +
			'<soap12:Body>';
			
	const soapClosing = 
			'</soap12:Body>' +
		'</soap12:Envelope>';
		
	return soapHeader + soapBody + soapClosing;
};


module.exports.getContribuyentes = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const rnc = event.pathParameters.rnc;
	console.log(rnc);

	const url = 'http://www.dgii.gov.do/wsMovilDGII/WSMovilDGII.asmx';

	const headers = {
	  'Content-Type': 'application/soap+xml; charset=utf-8',
	  'soapAction': 'https://dgii.gov.do/GetContribuyentes',
	};
	
	const xml = composeSoapXml(
		'<GetContribuyentes xmlns="http://dgii.gov.do/">' +
			`<value>${rnc}</value>` +
			'<patronBusqueda>0</patronBusqueda>' +
			'<inicioFilas>1</inicioFilas>' +
			'<filaFilas>1</filaFilas>' +
			'<IMEI>""</IMEI>' +
		'</GetContribuyentes>'
	);

	(async () => {
		try {
			const { response } = await soapRequest(url, headers, xml);
			const { body, statusCode } = response;
			console.log('RESPONSE: ', response);
				
			parseString(body, function (err, result) {
				const parsedResponse = JSON.parse(result['soap:Envelope']['soap:Body'][0].GetContribuyentesResponse[0].GetContribuyentesResult[0]);
				
				// Handle RNC not found.
				// We return an empty array instead of a message
				// to make it easier for the application making
				// the request to handle the Not Found case.
				if (parsedResponse === 0) {
					callback(null, responses.success([]));
					return;
				}
				
				const paymentRegimeDict = { 1: 'N/D', 2: 'NORMAL', 3: 'PST' }
				const responseObject = {
					rnc: parsedResponse.RGE_RUC,
					name: parsedResponse.RGE_NOMBRE.replace(/\s+/g, " "),
					commercialName: parsedResponse.NOMBRE_COMERCIAL,
					category: parsedResponse.CATEGORIA,
					status: parsedResponse.ESTATUS === '2' ? 'active' : 'inactive',
					paymentRegime: paymentRegimeDict[parsedResponse.REGIMEN_PAGOS],
				};
				callback(null, responses.success(responseObject));
			});
		} catch (error) {
			console.log('Error: ', error);
		}
	})();
	
};


module.exports.getNcf = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const rnc = event.pathParameters.rnc;
	const ncf = event.pathParameters.ncf;
	console.log(rnc);
	console.log(ncf);

	const url = 'http://www.dgii.gov.do/wsMovilDGII/WSMovilDGII.asmx';

	const headers = {
	  'Content-Type': 'application/soap+xml; charset=utf-8',
	  'soapAction': 'https://dgii.gov.do/GetNCF',
	};

	const xml = composeSoapXml(
		'<GetNCF xmlns="http://dgii.gov.do/">' +
			`<RNC>${rnc}</RNC>` +
			`<NCF>${ncf}</NCF>` +
			'<IMEI>""</IMEI>' +
		'</GetNCF>'
	);

	(async () => {
		try {
			const { response } = await soapRequest(url, headers, xml);
			const { body, statusCode } = response;
			console.log('RESPONSE: ', response);			
			
			parseString(body, function (err, result) {
				const parsedResponse = JSON.parse(result['soap:Envelope']['soap:Body'][0].GetNCFResponse[0].GetNCFResult[0]);
				const responseObject = { valid: parsedResponse.ES_VALIDO ? true : false };
				
				callback(null, responses.success(responseObject));
			});
		} catch (error) {
			// Handle not found or invalid NCF and RNC combination
			console.log('Error: ', error);
			callback(null, responses.success({valid: false}));
		}
	})();
};
