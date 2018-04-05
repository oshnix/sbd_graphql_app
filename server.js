const mongoose = require("mongoose");
const fakerRu = require('faker/locale/ru');
const faker = require('faker');
const builder = require('./src/mongo/staffBuilder');
const statuses = require('./src/mongo/staffStatuses');
const nicknameData = require('./src/mongo/nicknameGeneratorData');

const model = builder(mongoose);

require('dotenv').config();

const headPosition = "Царь";
const minDateToBeAlive = new Date("1930-01-01");
const minDate = new Date("1000-01-01");
const maxDate = new Date("1999-12-12");
const nicknamePossibility = 0.3;
const randomAmount = 100;
const dataPackSize = 50;

const unactiveStatuses = [
	"Retired",
	"Dead",
	"Missing",
	"Fired"
];

let possiblePositions = [];
possiblePositions.push(headPosition);

for(let i = 0; i < 1000; i++) {
	possiblePositions.push(faker.name.jobTitle());
}

function createSalary(){
	let salary = faker.random.number(1000);
	salary = salary - salary % 10;
	salary = salary > 0 ? salary : 10;
	return salary;
}

function capFirst(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function generateNickname(){
	return `${capFirst(faker.random
		.arrayElement(nicknameData.adjectives))} ${capFirst(faker.random
		.arrayElement(nicknameData.nouns))}`;
}

function dealWithStatuses(isAlive){
	let retArray = [];
	let count = faker.random.number(3);
	count = count > 0 ? count : 1;
	while(count > 0) {
		let status = faker.random.arrayElement(statuses);
		if (isAlive || unactiveStatuses.indexOf(status) === -1) {
			retArray.push(status);
		}
	}
	return retArray;
}

function createPerson(){
	let name = fakerRu.name.findName().split(" ");
	let position = faker.random.arrayElement(possiblePositions);
	let nickname = undefined;
	let isNicknamePresent = (faker.random.number(randomAmount) / randomAmount) > (1 - nicknamePossibility);
	let birthDate = faker.date.between(minDate, maxDate);
	let salary, isActive, status;
	let description = `${fakerRu.name.jobDescriptor()} in Area: ${fakerRu.name.jobArea()}`;
	let parentPosition;

	if(position === headPosition) {
		salary = 1000;
		parentPosition = null;
	} else {
		salary = createSalary();
		parentPosition = faker.random.arrayElement(possiblePositions);
	}

	if (isNicknamePresent) {
		nickname = generateNickname();
	}

	if(birthDate < minDateToBeAlive) {
		isActive = false;
		status = ["Dead"];
	} else {
		isActive = faker.random.boolean();
		status = dealWithStatuses(isActive);
	}

	let object = {
		firstName: name[0],
		lastName: name[1],
		position,
		salary,
		birthDate,
		isActive,
		status,
		description
	};
	if(nickname)
		object.nickname = nickname;
	if(parentPosition)
		object.parentPosition = parentPosition;
	return object
}

require('./src/mongo/mongoConnector')(mongoose).then(() => {
	//let createdDataCount = 2 * 1000 * 1000;
	let createdDataCount = 100;
	let sentDataCount = createdDataCount;

	let canWrite = true;
	let dataToWrite = [];

	while(createdDataCount > 0 || sentDataCount > 0) {
		if(createdDataCount > 0){
			let dataArray = [];
			for (let i = 0; i < dataPackSize; ++i){
				dataArray.push(createPerson());
			}
			createdDataCount -= dataPackSize;
			dataToWrite.push(dataArray);
		}
		if (canWrite) {
			canWrite = false;
			model.insertMany(dataToWrite.pop()).then(() => {
				canWrite = true;
			})
		}
	}
});