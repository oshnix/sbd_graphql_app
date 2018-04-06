const schemaComposer = require('graphql-compose').schemaComposer;


module.exports = ({schemaTC, resolversData, mutationsData}) => {
	let resolvers = Object.create(null), mutations = Object.create(null);

	for (let resolverName in resolversData) {
		resolvers[resolverName] = schemaTC.getResolver(resolversData[resolverName]);
	}

	for (let mutationName in mutationsData) {
		mutations[mutationName] = schemaTC.getResolver(mutationsData[mutationName]);
	}

	schemaComposer.rootQuery().addFields(resolvers);
	schemaComposer.rootMutation().addFields(mutations);
};