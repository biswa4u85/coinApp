System.config({
  //use typescript for compilation
  transpiler: 'typescript',
  //typescript compiler options
  typescriptOptions: {
    emitDecoratorMetadata: true
  },
  //map tells the System loader where to look for things
  map: {
    app: "./src",
    jquery: 'https://code.jquery.com/jquery-2.2.3.min.js',
    'owl-carousel': 'https://cdnjs.cloudflare.com/ajax/libs/owl-carousel/1.3.3/owl.carousel.min.js'
  },

  meta: {
    'owl-carousel': {
      deps: ['jquery']
    }
  },

  //packages defines our app package
  packages: {
    app: {
      main: './main.ts',
      defaultExtension: 'ts'
    }
  }
});
