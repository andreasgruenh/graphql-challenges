const rootValue = {
  user: async (args, req) => {
    return await req.dependencies.userRepository.getById(args.id);
  }
};

module.exports = rootValue;
