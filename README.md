# serverless-dgii-service

Serverless framework template for AWS Lambda based REST service that provides DGII RNC lookup operations. RNCs (Registro Nacional del Contribuyente) are Dominican Republic's taxpayer registration numbers. They are managed by Dominican Republic tax office DGII (Dirección General de Impuestos Internos).


## Quick Start

1. **Get Serverless:**

	You can skip this step if already have the [Serverless Framework](https://serverless.com/framework/) installed on your machine.
  
	```bash
  	# Install the Serverless Framework via NPM
  	npm install -g serverless
	```

2. **Setup the project:**

	Set up the project inside a new empty directory.
	
	```bash
	# Install project using serverless
	serverless install --url https://github.com/marcus-almeida/dgii-serverless-service.git --name <insert_desired_name_of_service_here>
	# Install project dependencies
	npm install
	```
	
3. **Set-up your [Provider Credentials](./docs/providers/aws/guide/credentials.md)**. [Watch the video on setting up credentials](https://www.youtube.com/watch?v=HSd9uYj2LJA)

	Long story short create a file called credentials (no extension) in a directory called .aws within your home directory. (e.g. /Users/MarcusAlmeida/\.aws/credentials) and add these lines to it (providing your own aws credentials obviously):
	
	```bash
	[serverless]
	aws_access_key_id=AKIAKBJIH3WIVA3Q33AF
	aws_secret_access_key=Wt67+wkqPXM4n7K9rISLAnPvb8xfH7Nox3jVsB+b
	```
	
4. **Deploy!**

	The project provides npm scripts to make deployment a breeze!
	
	```bash
	# Deploy to AWS
	npm run aws-deploy
	```
	
## Service Usage

  We currently have a version deployet at https://asd8p4kvlc.execute-api.us-east-1.amazonaws.com/dev/getcontribuyentes/{rnc}.

  To use the service just send a GET request adding your RNC to the path parameter. This will return an object (JSON) with the company or individual information if it is a valid RNC. If the RNC is not valid or doesn't exist it returns an empty array [].

	```console
	
  	# GET request to (valid RNC):
  	https://asd8p4kvlc.execute-api.us-east-1.amazonaws.com/dev/getcontribuyentes/130102058
		# Yields:
		{
			"rnc":"130102058",
			"name":"DISTRIBUIDORA A & M SRL",
			"commercialName":"DISTRIBUIDORA A & M ",
			"category":"0",
			"status":"active",
			"paymentRegime":"NORMAL"
		}
	
  	# GET request to (invalid RNC):
  	https://asd8p4kvlc.execute-api.us-east-1.amazonaws.com/dev/getcontribuyentes/130102340580
		# Yields:
		[]
		
	```
	
## To consider

  This project also contains a scripts to invoke functions inside handler.js locally (currently only getContribuyentes, more coming soon). This commant takes parametes from paramaters.json file (which you can edit with your own info) and sends it to the function being called. For example you can call getContribuyentes locally with:

	```bash
		npm run getContribuyentes
	```
	