const rootValue = {
  user: async (args, req) => {
    return await req.dependencies.userRepository.getById(args.id);
  },
  setUserName: async (args, req) => {
    console.log(args.id, args.name);
    return await req.dependencies.userRepository.getById(args.id);
  },
};

module.exports = rootValue;
