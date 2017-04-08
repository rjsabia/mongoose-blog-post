exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://localhost/mongoose-blog-post';
exports.TEST_DATABASE_URL = (
	process.env.TEST_DATABASE_URL ||
	'mongodb://localhost/test-mongoose-blog-post');
exports.PORT = process.env.PORT || 8080;






// exports.PORT = process.env.PORT || 8080;
// console.log(process.env.DATABASE_URL);